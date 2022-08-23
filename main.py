import asyncio
import json
import sys
from examples.listen_and_respond_to_rfqs import listen_and_respond_to_rfqs
from examples.place_orders import place_orders
import inquirer
import logging

logger = logging.getLogger()

question_1_rfq = "Listen and Respond to RFQs"
question_2_single_orders = "Place Single Leg Orders"


def main():
    # Load from a config file
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

    answer = inquirer.list_input("Flow selection",
                                 choices=[question_1_rfq, question_2_single_orders])

    logger.info("Selected Flow: %s", answer)
    # 1.
    # Example code to fetch entities, listen and respond to RFQs
    if answer == question_1_rfq:
        asyncio.ensure_future(listen_and_respond_to_rfqs(cfg), loop=loop)

    # 2.
    # Example code to place orders
    if answer == question_2_single_orders:
        asyncio.ensure_future(place_orders(cfg), loop=loop)

    loop.run_forever()

    return 0


if __name__ == "__main__":
    main()
