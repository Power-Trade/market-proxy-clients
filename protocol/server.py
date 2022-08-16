import enum
import json

import jsonschema
from jsonschema import validate


class MessageType(enum.Enum):
    command_response = 1
    heartbeat = 2


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
    for key, val in msg.items():  # Shortcut to get the first and only key/value. Only one iteration will occur.
        msg_type = MessageType[key]  # Check if the message type is supported. Throws if invalid
        validate_message(msg_type, val)  # Validate message body. Throws if invalid
        return ServerMessage(msg_type, val)


def validate_message(msg_type: MessageType, body: dict):
    match msg_type:
        case MessageType.command_response:
            return validate(instance=body, schema=command_response_schema)
        case MessageType.heartbeat:
            return validate(instance=body, schema=heartbeat_schema)
        case _:
            err = "no validator for supported message type: {}".format(msg_type)
            print(err)
            raise AssertionError(err)


# ============== Schemas ==============

command_response_schema = {
    "type": "object",
    "properties": {
        "error_code": {"type": "string"},
        "error_text": {"type": "string"},
        "user_tag": {"type": "string"}
    }
}

heartbeat_schema = {
    "type": "object",
    "properties": {
        "server_utc_timestamp": {"type": "string"}
    }
}
