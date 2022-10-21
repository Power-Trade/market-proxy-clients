import asyncio
import json
import sys
import inquirer
import logging

from examples.listen_and_respond_to_rfqs import listen_and_respond_to_rfqs
from examples.place_orders import place_orders
from examples.place_rfqs import place_rfqs
from examples.query_positions import query_positions

logger = logging.getLogger()

question_1_rfq = "Listen and Respond to RFQs"
question_2_single_orders = "Place Single Leg Orders"
question_3_positions = "Query positions with http"
question_4_rfqs = "Place single leg RFQ"


async def main():
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

    choices = [question_1_rfq, question_2_single_orders,
               question_3_positions, question_4_rfqs]

    if len(args) == 3 and choices[int(args[2])]:
        answer = choices[int(args[2])]
    else:
        answer = inquirer.list_input("Flow selection",
                                     choices=choices)

    logger.info("Selected Flow: %s", answer)
    # 1.
    # Example code to fetch entities, listen and respond to RFQs
    if answer == question_1_rfq:
        await listen_and_respond_to_rfqs(cfg)

    # 2.
    # Example code to place orders
    if answer == question_2_single_orders:
        await place_orders(cfg)

    # 3.
    # Example code to query positions with http
    if answer == question_3_positions:
        query_positions(cfg)

    # 4.
    # Example code to query positions with http
    if answer == question_4_rfqs:
        await place_rfqs(cfg)

    return 0


if __name__ == "__main__":
    asyncio.run(main())
