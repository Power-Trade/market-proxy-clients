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


async def handle_order_message(message: server.ServerMessage, client: ws_client.ProxyWSClient):
    # Message type one of order_added, order_deleted, order_updated, order_executed
    logging.info(
        "Order message handled\n%s [%s]", message.type().name, message.body())


async def place_order(client: ws_client.ProxyWSClient, mh: ws_client.MessageHandler, side, price, quantity, instrument):
    f = asyncio.Future()

    async def watch_order_accepted(message: server.ServerMessage, client: ws_client.ProxyWSClient):
        logging.info(
            "Order accepted handled\n%s [%s]", message.type().name, message.body())
        f.set_result(True)

    mh.register_handler(server.MessageType.order_accepted,
                        watch_order_accepted)

    await client.send_single_leg_order(side, price, quantity, instrument)
    await async_result(f)

    mh.unregister_handler(server.MessageType.order_accepted)

    logging.info("order placement success")


async def fetch_positions(client: ws_client.ProxyWSClient, mh: ws_client.MessageHandler):
    positions_request_tag = "order"
    positions_request_future = mh.watch_tag(positions_request_tag)

    await client.fetch_positions(positions_request_tag)
    positions_resp: server.ServerMessage = await async_result(positions_request_future)

    # Assert response message type
    assert (positions_resp.type() == server.MessageType.positions_response)

    logging.info("fetching positions success")


async def place_orders(cfg):
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
    mh.register_handler(server.MessageType.order_added,
                        handle_order_message)
    mh.register_handler(server.MessageType.order_deleted, handle_order_message)
    mh.register_handler(server.MessageType.order_updated, handle_order_message)
    mh.register_handler(server.MessageType.order_executed,
                        handle_order_message)
    mh.register_handler(server.MessageType.execution,
                        handle_order_message)

    # Order placement notes:
    #
    # 1. Order quantity and price are floating point numbers sent as string
    #    price: "825" or quantity: "1" will fail
    #    price: "825.0" and quantity: "1.0" will succeed
    # 2. Symbols can be looked up in the entities_and_rules_response message
    #    cf `./listen_and_respond_to_rfqs.py`
    #    or https://api-docs-5180b.web.app/docs/web-socket-interface/entities-and-rules/entities-and-rules-response

    # Place OPTION order
    await place_order(client, mh, "buy", "10000.0", "0.1", "BTC-20230630-21000C")

    # Place PERPETUAL order
    await place_order(client, mh, "sell", "825.0", "10.0", "BTC-USD-PERPETUAL")

    # Place SPOT order
    await place_order(client, mh, "buy", "37148.0", "1.0", "BTC-USD")

    # Fetching positions
    await fetch_positions(client, mh)

    # Loop forever
    while True:
        await asyncio.sleep(10)
