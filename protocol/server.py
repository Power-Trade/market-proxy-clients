import enum
import json

from jsonschema import validate


class MessageType(enum.Enum):
    command_response = 1
    heartbeat = 2
    snapshot = 3
    order_added = 4
    order_deleted = 5
    order_updated = 6
    order_executed = 7


class ServerMessage:
    def __init__(self, t: MessageType, body: dict):
        self._t = t
        self._body = body

    def type(self) -> MessageType:
        return self._t

    def body(self) -> dict:
        return self._body


def parse(raw) -> ServerMessage:
    msg: dict = json.loads(raw)
    # Shortcut to get the first and only key/value. Only one iteration will occur.
    for key, val in msg.items():
        # Check if the message type is supported. Throws if invalid
        msg_type = MessageType[key]
        # Validate message body. Throws if invalid
        validate_message(msg_type, val)
        return ServerMessage(msg_type, val)


def validate_message(msg_type: MessageType, body: dict):
    match msg_type:
        case MessageType.command_response:
            return validate(instance=body, schema=command_response_schema)
        case MessageType.heartbeat:
            return validate(instance=body, schema=heartbeat_schema)
        case MessageType.snapshot:
            return validate(instance=body, schema=snapshot_schema)
        case MessageType.order_added:
            return validate(instance=body, schema=order_added_schema)
        case MessageType.order_deleted:
            return validate(instance=body, schema=order_deleted_schema)
        case MessageType.order_updated:
            return validate(instance=body, schema=order_updated_schema)
        case MessageType.order_executed:
            return validate(instance=body, schema=order_executed_schema)
        case _:
            err = "no validator for supported message type: {}".format(
                msg_type)
            print(err)
            raise AssertionError(err)


# ============== Schemas ==============

# Example:
# {"command_response":{"error_code":"0","error_text":"success","user_tag":"rfq_tag"}}
command_response_schema = {
    "type": "object",
    "properties": {
        "error_code": {"type": "string"},
        "error_text": {"type": "string"},
        "user_tag": {"type": "string"}
    }
}
# Example:
# {"heartbeat":{"server_utc_timestamp":"1660733618452901"}}
heartbeat_schema = {
    "type": "object",
    "properties": {
        "server_utc_timestamp": {"type": "string"}
    }
}

# Example:
# {"snapshot":{"server_utc_timestamp":"1660727998458179","market_id":"255","tradeable_entity_id":"117@1/336@-1/1244@-1/1473@1","symbol":"BTC-20220930-25000C@1/BTC-20220930-26000C@-1/BTC-20220930-22000P@-1/BTC-20220930-23000P@1","buy":[],"sell":[]}}
snapshot_schema = {
    "type": "object",
    "properties": {
        "server_utc_timestamp": {"type": "string"},
        "market_id": {"type": "string"},
        "symbol": {"type": "string"},
        "buy": {
            "type": "array",
            "items": {
                "order": {
                    "type": "object",
                    "properties": {
                        "price": {"type": "string"},
                        "quantity": {"type": "string"},
                        "ordered": {"type": "string"},
                        "utc_timestamp": {"type": "string"},
                    }
                }
            }
        },
        "sell": {
            "type": "array",
            "items": {
                "order": {
                    "type": "object",
                    "properties": {
                        "price": {"type": "string"},
                        "quantity": {"type": "string"},
                        "ordered": {"type": "string"},
                        "utc_timestamp": {"type": "string"},
                    }
                }
            }
        },
    }
}

# Example:
# {"order_added":{"server_utc_timestamp":"1660735105778297","utc_timestamp":"1660735105767221","market_id":"255","tradeable_entity_id":"2752@1/2771@1","symbol":"ETH-20220902-1500P@1/ETH-20220902-2000C@1","side":"sell","order_id":"29872771","price":"0.0","quantity":"1.0"}}
order_added_schema = {
    "type": "object",
    "properties": {
        "server_utc_timestamp": {"type": "string"},
        "market_id": {"type": "string"},
        "symbol": {"type": "string"},
        "tradeable_entity_id": {"type": "string"},
        "side": {"type": "string"},
        "order_id": {"type": "string"},
        "price": {"type": "string"},
        "quantity": {"type": "string"},
        "utc_timestamp": {"type": "string"}
    }
}

# Example:
# {"order_deleted":{"server_utc_timestamp":"1660735165811304","utc_timestamp":"1660735165807583","market_id":"255","tradeable_entity_id":"2752@1/2771@1","symbol":"ETH-20220902-1500P@1/ETH-20220902-2000C@1","side":"sell","order_id":"29872771"}}
order_deleted_schema = {
    "type": "object",
    "properties": {
        "server_utc_timestamp": {"type": "string"},
        "market_id": {"type": "string"},
        "symbol": {"type": "string"},
        "tradeable_entity_id": {"type": "string"},
        "side": {"type": "string"},
        "order_id": {"type": "string"},
        "utc_timestamp": {"type": "string"}
    }
}

# Example
#
order_updated_schema = {
    "type": "object",
    "properties": {
        "server_utc_timestamp": {"type": "string"},
        "market_id": {"type": "string"},
        "symbol": {"type": "string"},
        "tradeable_entity_id": {"type": "string"},
        "side": {"type": "string"},
        "old_order_id": {"type": "string"},
        "new_order_id": {"type": "string"},
        "price": {"type": "string"},
        "quantity": {"type": "string"},
        "utc_timestamp": {"type": "string"}
    }
}

# Example
#
order_executed_schema = {
    "type": "object",
    "properties": {
        "server_utc_timestamp": {"type": "string"},
        "market_id": {"type": "string"},
        "symbol": {"type": "string"},
        "tradeable_entity_id": {"type": "string"},
        "side": {"type": "string"},
        "order_id": {"type": "string"},
        "price": {"type": "string"},
        "quantity": {"type": "string"},
        "utc_timestamp": {"type": "string"}
    }
}
