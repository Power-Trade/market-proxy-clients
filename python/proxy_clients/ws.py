import websockets
import asyncio
import json
from utils.access_token import generate_access_token
import utils.time
import protocol.server as server

import logging

logging.getLogger("websockets").setLevel(logging.CRITICAL)


def generate_heartbeat():
    return {"heartbeat": {"timestamp": str(utils.time.time_us())}}


class ProxyWSClient:

    def __init__(self):
        self.api_key: str = None
        self.private_key: str = None
        self.authed = False
        self.ws = None
        self.recv_queue: asyncio.Queue = None
        self.logger = logging.getLogger()

    # ====== INTERFACE ======
    async def connect(self, url):
        self.logger.log(logging.INFO, "connecting to %s", url)
        self.ws = await websockets.connect(url)
        self.recv_queue = asyncio.Queue()
        asyncio.ensure_future(self.__read())
        asyncio.ensure_future(self.__heartbeat_timer())

    async def authenticate(self, user_tag, api_key, private_key):
        token = generate_access_token(api_key, private_key)
        await self.__write({"authenticate": {"user_tag": user_tag, "credentials_secret": token}})

    async def send_multi_leg_order(self, side, price, quantity, legs):
        await self.__write({
            "new_order": {
                # Send market id of 0 for firm orders. Send 255 for indicative orders (RFQs)
                "market_id": "0",
                # buy or sell
                "side": side,
                # Limit orders are always GTC (good till cancelled)
                "type": "LIMIT",
                "time_in_force": "GTC",
                # The API expect a floating point quantity sent as string
                "quantity": str(quantity),
                "minimum_quantity": "0.0",
                # The API expect a floating point price sent as string
                "price": price,
                # GUID for the order chosen by the client
                "client_order_id": str(utils.time.time_us()),
                # Number of 10 min exchange cycles, the order will be active for
                # "recv_window": "1" -> valid for 10 minutes
                # "recv_window": "2" -> valid for 20 minutes etc ...
                "recv_window": "4",
                # Current UTC timestamp
                "timestamp": str(utils.time.time_us()),
                # Array of legs in {"sym": "BTC-20220902-17000P", "ratio": "1"} format
                # sym -> Symbol as string and ratio -> integer as string
                "legs": legs,
                # Request tag identifier
                "user_tag": "not in use"
            }
        })

    async def send_single_leg_order(self, side, price, quantity, symbol):
        await self.__write({
            "new_order": {
                # Send market id of 0 for firm orders. Send 255 for indicative orders (RFQs)
                "market_id": "0",
                # buy or sell
                "side": side,
                # Limit orders are always GTC (good till cancelled)
                "type": "LIMIT",
                "time_in_force": "GTC",
                # The API expect a floating point quantity sent as string
                "quantity": str(quantity),
                # The API expect a floating point price sent as string
                "price": price,
                # GUID for the order chosen by the client
                "client_order_id": str(utils.time.time_us()),
                # Number of 10 min exchange cycles, the order will be active for
                # "recv_window": "1" -> valid for 10 minutes
                # "recv_window": "2" -> valid for 20 minutes etc ...
                "recv_window": "144",  # 1 day = 24 * 6 * (10min cycles)
                # Current UTC timestamp
                "timestamp": str(utils.time.time_us()),
                # Symbol as string. e.g. `BTC-USD-PERPETUAL`
                "symbol": symbol,
                # Request tag identifier
                "user_tag": "not in use"
            }
        })

    async def send_single_leg_rfq(self, side, quantity, symbol):
        await self.__write({
            "new_order": {
                # Send market id of 0 for firm orders. Send 255 for indicative orders (RFQs)
                "market_id": "none",
                # buy or sell
                "side": side,
                # Limit orders are always GTC (good till cancelled)
                "type": "LIMIT",
                "time_in_force": "GTC",
                # The API expect a floating point quantity sent as string
                "quantity": str(quantity),
                # The API expect a floating point price sent as string
                "price": "1000.0",
                # GUID for the order chosen by the client
                "client_order_id": str(utils.time.time_us()),
                # Number of 10 min exchange cycles, the order will be active for
                # "recv_window": "1" -> valid for 10 minutes
                # "recv_window": "2" -> valid for 20 minutes etc ...
                "recv_window": "2",  # 1 day = 24 * 6 * (10min cycles)
                # Current UTC timestamp
                "timestamp": str(utils.time.time_us()),
                # Symbol as string. e.g. `BTC-USD-PERPETUAL`
                "symbol": symbol,
                # Request tag identifier
                "user_tag": "not in use"
            }
        })

    async def fetch_positions(self, user_tag):
        await self.__write({
            "position_info": {
                # Request tag identifier
                "user_tag": user_tag
            }
        })

    async def consume(self) -> server.ServerMessage:
        """
        Consume messages from the client.

        This method should only be called after successfully connecting.
        :return: dict
        """
        assert (self.recv_queue is not None)
        return await self.recv_queue.get()

    async def register_for_rfqs(self, tag):
        # After calling this method, the server will start streaming RFQs to the client.
        await self.__write({"register_for_rfqs": {"user_tag": tag}})

    async def deregister_for_rfqs(self, tag):
        # After calling this method, the server will stop streaming RFQs to the client.
        await self.__write({"deregister_for_rfqs": {"user_tag": tag}})

    async def get_entities(self, user_tag):
        # Request to fetch all entities tradeable on the exchange
        await self.__write({
            "entities_and_rules_request": {
                # Request tag identifier
                "user_tag": user_tag
            }
        })

    # ====== IMPL =======

    async def __read(self):
        msg = None
        while True:
            # Read message from websocket
            try:
                msg = await self.ws.recv()
                self.logger.debug("read: %s", msg[:1000])
            except Exception as err:
                self.logger.error("error reading from websocket\n%s", err)
                # Send None to consumer queue to signal cancellation.
                await self.recv_queue.put(None)
                return

            # Parse message and send to consumer if valid
            try:
                # Parse message, throws on failure.
                server_message = server.parse(msg)
                await self.__handle_message(server_message)
            except Exception as err:
                self.logger.error(
                    "error parsing server message\nMessage:%s", msg[:1000])

    async def __write(self, msg):
        raw_msg = json.dumps(msg)
        self.logger.debug("write: %s", msg)
        await self.ws.send(raw_msg)

    async def __heartbeat_timer(self):
        while True:
            await asyncio.sleep(5)
            await self.__write(generate_heartbeat())

    async def __handle_message(self, server_message: server.ServerMessage):
        # Check if there is an internal handler
        handler = ProxyWSClient.server_message_handlers.get(
            server_message.type())
        if handler is not None:
            # Handle internally, don't pass to consume queue.
            await handler(self, server_message)
        else:
            # Queue to be consumed
            self.recv_queue.put_nowait(server_message)

    async def __handle_heartbeat(self, server_message: server.ServerMessage):
        # calculate server latency
        client_timestamp = utils.time.time_us()
        server_timestamp = int(server_message.body()["server_utc_timestamp"])
        self.logger.debug("server latency: %sus",
                          client_timestamp - server_timestamp)
        # The server expects a heartbeat every 5 seconds
        await self.__write(generate_heartbeat())  # respond

    server_message_handlers = {
        server.MessageType.heartbeat: __handle_heartbeat,
    }


async def connect(url) -> ProxyWSClient:
    client = ProxyWSClient()
    await client.connect(url)
    return client


class MessageHandler:
    def __init__(self, client):
        self._client: ProxyWSClient = client
        self._message_type_handlers = dict()
        self._tag_handlers = dict()
        self._cancelled = False
        asyncio.ensure_future(self.__run())

    async def __run(self):
        while True:
            msg = await self._client.consume()
            if msg is None:
                # Flag from client meaning a disconnect has occurred.
                # Cancel all pending handlers
                self.__cancel_all()
                return
            handled = False
            # Check if message has a tag
            tag = msg.body().get("user_tag")
            if type(tag) is str:
                # Check if this tag has a handler
                handler: asyncio.Future = self._tag_handlers.pop(tag, None)
                if handler is not None:
                    handler.set_result(msg)
                    handled = True

            # Check if there is a generic handler
            func_handler = self._message_type_handlers.get(msg.type())
            if func_handler is not None:
                asyncio.ensure_future(func_handler(msg, self._client))
                continue  # Shortcut, no need to set/check handled
            if not handled:
                print(
                    "Message Handler - Unhandled message with type: {}".format(msg.type()))

    def __cancel_all(self):
        self._cancelled = True
        for future in self._tag_handlers.values():
            future.set_exception(RuntimeError("connection disconnected"))
        for future in self._message_type_handlers.values():
            future.set_exception(RuntimeError("connection disconnected"))
        self._tag_handlers.clear()
        self._message_type_handlers.clear()

    def watch_tag(self, tag: str) -> asyncio.Future:
        if self._cancelled:
            raise RuntimeError("connection disconnected")
        # Make sure this tag isn't already being wait for.
        assert (self._tag_handlers.get(tag) is None)
        f = asyncio.Future()
        self._tag_handlers[tag] = f
        return f

    def register_handler(self, msg_type: server.MessageType, handler):
        if self._cancelled:
            raise RuntimeError("connection disconnected")
        assert (self._message_type_handlers.get(msg_type) is None)
        self._message_type_handlers[msg_type] = handler

    def unregister_handler(self, msg_type: server.MessageType):
        if self._cancelled:
            raise RuntimeError("connection disconnected")
        self._message_type_handlers.pop(msg_type, None)
