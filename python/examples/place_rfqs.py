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

# store number of active RFQs per symbol
rfqs_by_symbol = {}


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


async def handle_order_message(message: server.ServerMessage, client: ws_client.ProxyWSClient):
    # Message type one of order_updated, order_executed
    logging.info(
        "Order message handled\n%s [%s]", message.type().name, message.body())


async def place_rfq(client: ws_client.ProxyWSClient, mh: ws_client.MessageHandler, side, quantity, instrument):
    await client.send_single_leg_rfq(side, quantity, instrument)


async def handle_order_added_message(message: server.ServerMessage, client: ws_client.ProxyWSClient):
    body = message.body()
    rfq_id = body["side"] + "-" + body["symbol"]
    existing_rfqs = rfqs_by_symbol[rfq_id] if rfq_id in rfqs_by_symbol else 0
    rfqs_by_symbol[rfq_id] = existing_rfqs + 1

    logging.info(
        "RFQ Added for [%s]. Total active %s RFQs: %i", rfq_id, rfq_id, rfqs_by_symbol[rfq_id])

    if rfqs_by_symbol[rfq_id] == 1:
        logging.info("Start Quoting %s", rfq_id)
    else:
        logging.info("Continue Quoting %s", rfq_id)


async def handle_order_deleted_message(message: server.ServerMessage, client: ws_client.ProxyWSClient):
    body = message.body()
    rfq_id = body["side"] + "-" + body["symbol"]
    rfqs_by_symbol[rfq_id] = rfqs_by_symbol[rfq_id] - 1

    logging.info(
        "RFQ expired for [%s]. Total active %s RFQs: %i", rfq_id, rfq_id, rfqs_by_symbol[rfq_id])

    if rfqs_by_symbol[rfq_id] == 0:
        logging.info("Stop Quoting %s", rfq_id)
    else:
        logging.info("Continue Quoting %s", rfq_id)


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
    mh.register_handler(server.MessageType.order_updated, handle_order_message)
    mh.register_handler(server.MessageType.order_executed,
                        handle_order_message)
    mh.register_handler(server.MessageType.order_accepted,
                        handle_order_message)

    # The order added handler will increment the number of active RFQs
    # That's a cue to start quoting
    mh.register_handler(server.MessageType.order_added,
                        handle_order_added_message)

    # The order deleted handler will decrement the number of active RFQs
    # That's a cue to stop quoting when it reaches 0
    mh.register_handler(server.MessageType.order_deleted,
                        handle_order_deleted_message)

    # Start streaming RFQs
    await subscribe_to_rfqs(client, mh)

    await asyncio.sleep(3)

    logging.info("place rfq")

    # RFQs will be placed by someone else, this is only for demonstration purposes
    await place_rfq(client, mh, "buy", "10.0", "BTC-20230630-21000C")
    await place_rfq(client, mh, "sell", "10.0", "BTC-20230630-21000C")

    # 5 seconds later, another RFQ comes in
    await place_rfq(client, mh, "sell", "10.0", "BTC-20230630-22000P")

    # 5 seconds later, another RFQ comes in for the 21000 Call
    await asyncio.sleep(5)
    await place_rfq(client, mh, "buy", "10.0", "BTC-20230630-21000C")

    # Loop forever while waiting for RFQs to expire
    while True:
        await asyncio.sleep(10)
