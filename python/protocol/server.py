import enum
import json

from jsonschema import validate

f_command_response_schema = open('json-schema/common/command-response.json')
command_response_schema = json.load(f_command_response_schema)

f_heartbeat_schema = open('json-schema/common/heartbeat.json')
heartbeat_schema = json.load(f_heartbeat_schema)

f_snapshot_schema = open(
    'json-schema/web-socket-interface/entities-and-rules/snapshot.json')
snapshot_schema = json.load(f_snapshot_schema)

f_order_added_schema = open(
    'json-schema/web-socket-interface/orders/order-added.json')
order_added_schema = json.load(f_order_added_schema)

f_order_deleted_schema = open(
    'json-schema/web-socket-interface/orders/order-deleted.json')
order_deleted_schema = json.load(f_order_deleted_schema)

f_order_updated_schema = open(
    'json-schema/web-socket-interface/orders/order-updated.json')
order_updated_schema = json.load(f_order_updated_schema)

f_order_executed_schema = open(
    'json-schema/web-socket-interface/orders/order-executed.json')
order_executed_schema = json.load(f_order_executed_schema)

f_order_accepted_schema = open(
    'json-schema/web-socket-interface/orders/order-accepted.json')
order_accepted_schema = json.load(f_order_accepted_schema)

f_execution_schema = open(
    'json-schema/web-socket-interface/orders/execution.json')
execution_schema = json.load(f_execution_schema)

f_entities_and_rules_response_schema = open(
    'json-schema/web-socket-interface/entities-and-rules/entities-and-rules-response.json')
entities_and_rules_response_schema = json.load(
    f_entities_and_rules_response_schema)

f_positions_response_schema = open(
    'json-schema/web-socket-interface/positions/position-response.json')
positions_response_schema = json.load(
    f_positions_response_schema)


class MessageType(enum.Enum):
    command_response = 1
    heartbeat = 2
    snapshot = 3
    order_added = 4
    order_deleted = 5
    order_updated = 6
    order_executed = 7
    order_accepted = 8
    execution = 9
    entities_and_rules_response = 10
    positions_response = 11


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
        validate_message(msg_type, msg)
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
        case MessageType.order_accepted:
            return validate(instance=body, schema=order_accepted_schema)
        case MessageType.execution:
            return validate(instance=body, schema=execution_schema)
        case MessageType.entities_and_rules_response:
            return validate(instance=body, schema=entities_and_rules_response_schema)
        case MessageType.positions_response:
            return validate(instance=body, schema=positions_response_schema)
        case _:
            err = "no validator for supported message type: {}".format(
                msg_type)
            print(err)
            raise AssertionError(err)
