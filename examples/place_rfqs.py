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


async def handle_snapshot(snapshot: server.ServerMessage, client: ws_client.ProxyWSClient):
    assert (snapshot.type() == server.MessageType.snapshot)
    logging.info("Snapshot arrived!\n%s", snapshot.body())


async def handle_order_message(message: server.ServerMessage, client: ws_client.ProxyWSClient):
    # Message type one of order_added, order_deleted, order_updated, order_executed
    logging.info(
        "Order message handled\n%s [%s]", message.type().name, message.body())


async def place_rfq(client: ws_client.ProxyWSClient, mh: ws_client.MessageHandler, side, quantity, instrument):
    await client.send_single_leg_rfq(side, quantity, instrument)

    logging.info("RFQ placement success")


async def subscribe_to_rfqs(client: ws_client.ProxyWSClient, mh: ws_client.MessageHandler):
    rfq_tag = "rfq"
    # Set up a future waiting for a response with this tag
    rfq_future = mh.watch_tag(rfq_tag)

    await client.register_for_rfqs(rfq_tag)  # Send RFQ request
    # Wait for rfq result arrive
    rfq_resp: server.ServerMessage = await async_result(rfq_future)
    # Assert response message type
    assert (rfq_resp.type() == server.MessageType.command_response)

    if rfq_resp.body()["error_code"] != "0":
        logging.error("rfq failed\n%s", rfq_resp)
        raise RuntimeError("rfq failed")
    logging.info("rfq success")


async def place_rfqs(cfg):
    logging.info("Starting websocket client")
    url = cfg["ws_url"]
    if url is None:
        raise RuntimeError("invalid cfg doesn't contain 'ws_url'")

    # Connect to proxy
    logging.info(url)
    client = await ws_client.connect(url)

    # Create an async message handler
    # This is used to subscribe to messages arriving from the proxy
    mh = ws_client.MessageHandler(client)

    # Authenticate with the proxy
    await do_auth(client, mh, cfg)

    # Before placing the order, register order message handlers
    mh.register_handler(server.MessageType.snapshot, handle_snapshot)
    mh.register_handler(server.MessageType.order_added,
                        handle_order_message)
    mh.register_handler(server.MessageType.order_deleted, handle_order_message)
    mh.register_handler(server.MessageType.order_updated, handle_order_message)
    mh.register_handler(server.MessageType.order_executed,
                        handle_order_message)
    mh.register_handler(server.MessageType.order_accepted,
                        handle_order_message)

    # Start streaming RFQs
    await subscribe_to_rfqs(client, mh)

    await asyncio.sleep(5)

    logging.info("place rfq")

    await place_rfq(client, mh, "buy", "10.0", "BTC-20230630-21000C")

    # Loop forever
    while True:
        await asyncio.sleep(10)
