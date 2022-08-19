import protocol.server as server
import proxy_clients.ws as ws_client
import asyncio
import logging
from utils.future import async_result

logging.getLogger('asyncio').setLevel(logging.WARNING)


logging.basicConfig(
    format='%(asctime)s %(levelname)-8s %(message)s',
    level=logging.DEBUG,
    datefmt='%Y-%m-%d %H:%M:%S')

entities_by_symbol = dict()


async def do_auth(client: ws_client.ProxyWSClient, mh: ws_client.MessageHandler, cfg):
    # Authenticate the connection
    auth_tag = "auth"
    # Set up a future waiting for a response with this tag
    auth_future = mh.watch_tag(auth_tag)
    # Send auth request
    await client.authenticate(auth_tag, cfg["api_key"], cfg["private_key"])
    # Wait for auth result to arrive
    auth_resp: server.ServerMessage = await async_result(auth_future)
    # Assert response message type
    assert (auth_resp.type() == server.MessageType.command_response)
    # Check auth was successful.
    if auth_resp.body()["error_code"] != "0":
        logging.error("auth failed\n%s", auth_resp)
        raise RuntimeError("auth failed")
    logging.info("auth success")


async def fetch_entities(client: ws_client.ProxyWSClient, mh: ws_client.MessageHandler):
    entities_tag = "entities"
    entities_future = mh.watch_tag(entities_tag)

    await client.get_entities(entities_tag)
    # Wait for entities result to arrive
    entities_resp: server.ServerMessage = await async_result(entities_future)

    # Assert response message type
    assert (entities_resp.type() ==
            server.MessageType.entities_and_rules_response)

    logging.info("entities success")

    symbols = entities_resp.body()["symbols"]

    for symbol in symbols:
        entities_by_symbol[symbol["symbol"]] = symbol


async def handle_snapshot(snapshot: server.ServerMessage, client: ws_client.ProxyWSClient):
    assert (snapshot.type() == server.MessageType.snapshot)
    logging.info("Snapshot arrived!\n%s", snapshot.body())


async def handle_order_message(message: server.ServerMessage, client: ws_client.ProxyWSClient):
    # Message type one of order_added, order_deleted, order_updated, order_executed
    logging.info(
        "Order message handled\n%s [%s]", message.type().name, message.body())


def legFromString(legString):
    leg = legString.split("@")
    return {"sym": leg[0], "ratio": leg[1]}


async def place_firm_multi_leg_order(client: ws_client.ProxyWSClient, payload):
    # Respond to indicative order with firm order
    side = "buy" if payload["side"] == "sell" else "sell"
    price = "1000.0" if side == "sell" else "900.0"
    legs = list(map(legFromString, payload["symbol"].split("/")))
    logging.debug("legs: %s", legs)
    await client.send_multi_leg_order(
        'my-multi-leg-order', side, price, payload["quantity"], legs)


async def handle_order_added_message(message: server.ServerMessage, client: ws_client.ProxyWSClient):
    body = message.body()
    logging.info(
        "Order added message handled\n%s [%s]", message.type().name, body)

    # Check if indicative order
    if (body["market_id"] == "255"):
        logging.info("RFQ received for %s %s", body["symbol"], body["side"])
        await place_firm_multi_leg_order(client, body)


async def place_perpetual_order(client: ws_client.ProxyWSClient, mh: ws_client.MessageHandler):
    perpetual_tag = "perpetual_order"
    entities_future = mh.watch_tag(perpetual_tag)

    await client.send_single_leg_order(perpetual_tag, "buy", "23700.0", "0.1", "BTC-USD-PERPETUAL")
    perpetual_resp: server.ServerMessage = await async_result(entities_future)

    # Assert response message type
    assert (perpetual_resp.type() == server.MessageType.command_response)

    if perpetual_resp.body()["error_code"] != "0":
        logging.error("placing perpetual failed\n%s", perpetual_resp)
        raise RuntimeError("perpetual failed")
    logging.info("perpetual success")


async def subscribe_to_rfqs(client: ws_client.ProxyWSClient, mh: ws_client.MessageHandler):
    rfq_tag = "rfq"
    # Set up a future waiting for a response with this tag
    rfq_future = mh.watch_tag(rfq_tag)

    # Before sending the request, register handlers for 'snapshot' and order message types
    # Register a handler for snapshot messages
    mh.register_handler(server.MessageType.snapshot, handle_snapshot)
    mh.register_handler(server.MessageType.order_added,
                        handle_order_added_message)
    mh.register_handler(server.MessageType.order_deleted, handle_order_message)
    mh.register_handler(server.MessageType.order_updated, handle_order_message)
    mh.register_handler(server.MessageType.order_executed,
                        handle_order_message)
    mh.register_handler(server.MessageType.order_accepted,
                        handle_order_message)

    await client.register_for_rfqs(rfq_tag)  # Send RFQ request
    # Wait for rfq result arrive
    rfq_resp: server.ServerMessage = await async_result(rfq_future)
    # Assert response message type
    assert (rfq_resp.type() == server.MessageType.command_response)

    if rfq_resp.body()["error_code"] != "0":
        logging.error("rfq failed\n%s", rfq_resp)
        raise RuntimeError("rfq failed")
    logging.info("rfq success")


async def run(cfg):
    logging.info("Starting websocket client")
    url = cfg["ws_url"]
    if url is None:
        raise RuntimeError("invalid cfg doesn't contain 'ws_url'")

    # Connect to proxy
    logging.info(url)
    client = await ws_client.connect(url)

    # Create an async message handler.
    # This is used to subscribe to messages arriving from the proxy.
    mh = ws_client.MessageHandler(client)

    # === Main app begins here ===
    await do_auth(client, mh, cfg)

    await fetch_entities(client, mh)

    await subscribe_to_rfqs(client, mh)

    await place_perpetual_order(client, mh)

    # Loop forever
    while True:
        await asyncio.sleep(10)
