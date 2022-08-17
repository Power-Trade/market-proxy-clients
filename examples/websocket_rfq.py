import sys
import json
import asyncio
import logging
from utils.future import async_result

logging.getLogger('asyncio').setLevel(logging.WARNING)

import proxy_clients.ws as ws_client
import protocol.server as server

logging.basicConfig(
    format='%(asctime)s %(levelname)-8s %(message)s',
    level=logging.DEBUG,
    datefmt='%Y-%m-%d %H:%M:%S')


async def handle_snapshot(snapshot: server.ServerMessage):
    assert (snapshot.type() == server.MessageType.snapshot)
    logging.info("Snapshot arrived!\n%s", snapshot.body())


async def handle_order_message(message: server.ServerMessage):
    # Message type one of order_added, order_deleted, order_updated, order_executed
    logging.info("Order message handled\n%s [%s]", message.type().name, message.body())


async def run(cfg):
    url = cfg["ws_url"]
    if url is None:
        raise RuntimeError("invalid cfg doesn't contain 'ws_url'")

    # Connect to proxy
    client = await ws_client.connect(url)

    # Create an async message handler.
    # This is used to subscribe to messages arriving from the proxy.
    mh = ws_client.MessageHandler(client)

    # === Main app begins here ===

    # Authenticate the connection
    auth_tag = "auth"
    auth_future = mh.watch_tag(auth_tag)  # Set up a future waiting for a response with this tag
    await client.authenticate(auth_tag, cfg["api_key"], cfg["private_key"])  # Send auth request
    auth_resp: server.ServerMessage = await async_result(auth_future)  # Wait for auth result to arrive
    assert (auth_resp.type() == server.MessageType.command_response)  # Assert response message type
    # Check auth was successful.
    if auth_resp.body()["error_code"] != "0":
        logging.error("auth failed\n%s", auth_resp)
        raise RuntimeError("auth failed")
    logging.info("auth success")

    # Auth success, register for rfqs
    rfq_tag = "rfq"
    rfq_future = mh.watch_tag(rfq_tag)  # Set up a future waiting for a response with this tag

    # Before sending the request, register handlers for 'snapshot' and order message types
    mh.register_handler(server.MessageType.snapshot, handle_snapshot)  # Register a handler for snapshot messages
    mh.register_handler(server.MessageType.order_added, handle_order_message)
    mh.register_handler(server.MessageType.order_deleted, handle_order_message)
    mh.register_handler(server.MessageType.order_updated, handle_order_message)
    mh.register_handler(server.MessageType.order_executed, handle_order_message)

    await client.register_for_rfqs(rfq_tag)  # Send RFQ request
    rfq_resp: server.ServerMessage = await async_result(rfq_future)  # Wait for rfq result arrive
    assert (rfq_resp.type() == server.MessageType.command_response)  # Assert response message type

    if rfq_resp.body()["error_code"] != "0":
        logging.error("rfq failed\n%s", auth_resp)
        raise RuntimeError("rfq failed")
    logging.info("rfq success")

    # Loop forever
    while True:
        await asyncio.sleep(10)


if __name__ == '__main__':
    args = sys.argv
    if len(args) < 2:
        raise RuntimeError("insufficient arguments")

    # cfg file is 2nd arg
    f = open(args[1])
    cfg: dict = json.load(f)
    f.close()

    # assert config has an api_key + private key for JWT generation
    if "api_key" not in cfg:
        raise AssertionError("invalid cfg doesn't contain 'api_key'")
    if "private_key" not in cfg:
        raise AssertionError("invalid cfg doesn't contain 'private_key'")

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    asyncio.ensure_future(run(cfg), loop=loop)
    loop.run_forever()
