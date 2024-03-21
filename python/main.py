import asyncio
import json
import sys
import inquirer
import logging

from examples.listen_and_respond_to_rfqs import listen_and_respond_to_rfqs
from examples.place_orders import place_orders
from examples.place_rfqs import place_rfqs
from examples.query_positions import query_positions
from examples.query_balances import query_balances
from examples.query_servertime import query_servertime
from examples.query_exchangeinfo import query_exchangeinfo
from examples.query_orderbook import query_orderbook

logger = logging.getLogger()

question_1_rfq = "Listen and Respond to RFQs"
question_2_single_orders = "Place Single Leg Orders"
question_3_positions = "Query Positions with HTTP"
question_4_rfqs = "Place Single Leg RFQ"
question_5_balances = "Query Balances with HTTP"
question_6_servertime = "Query Server Time with HTTP"
question_7_exchinfo = "Query Exchange Info with HTTP"
question_8_orderbook = "Query Order Book with HTTP"

choices = [question_1_rfq, question_2_single_orders, question_3_positions, question_4_rfqs, question_5_balances, question_6_servertime, question_7_exchinfo, question_8_orderbook]

async def main():
    args = sys.argv
    if len(args) < 2:
        raise RuntimeError("Error - insufficient arguments provided at command line")

    # Load from config file
    # n.b. cfg file is 2nd arg
    cfg: dict = None
    with open(args[1]) as file:
        cfg = json.load(file)
        assert(cfg is not None)

    # assert config has an api_key + private key for JWT generation
    if "api_key" not in cfg:
        raise AssertionError("invalid cfg doesn't contain 'api_key'")

    if "private_key" not in cfg:
        raise AssertionError("invalid cfg doesn't contain 'private_key'")

    # check if choice provided was a valid data type i.e. integer
    if len(args) == 3 and not args[2].isdigit():
        raise ValueError("Invalid value provided: '{}' - must be an integer between 0 and {}".format(args[2], len(choices)))
    
    # check if user provided a valid input for the command choice
    if len(args) == 3 and len(choices) >= int(args[2]) and int(args[2]) >= 0:
        answer = choices[int(args[2])]
    else:
        # default to displaying choices for user selection if no choice given or choice was not valid
        answer = inquirer.list_input("Flow selection", choices=choices)

    logger.info("Selected Flow: %s", answer)

    # Choice #1
    # Example code to fetch entities, listen and respond to RFQs
    if answer == question_1_rfq:
        await listen_and_respond_to_rfqs(cfg)

    # Choice #2.
    # Example code to place orders
    elif answer == question_2_single_orders:
        await place_orders(cfg)

    # Choice #3.
    # Example code to query positions with http
    elif answer == question_3_positions:
        total_pnl = 0.00
        total_margin = 0.00
        resp = query_positions(cfg)
        logger.info("Received {} position records".format(len(resp.json()["positions_response"]["positions"])))
        for position in resp.json()["positions_response"]["positions"]:
            total_pnl += round(float(position["upnl"]), 4)
            total_margin += round(float(position["margin_value"]), 4)
            logger.info("-> Position for Coin {} has PNL {} Mark Price {} Margin {}".format(position["symbol"], position["upnl"], position["mark_price"], position["margin_value"]))
        logger.info("Total PNL is {} using Margin {}".format(total_pnl, total_margin))

    # Choice #4.
    # Example code to query positions with http
    elif answer == question_4_rfqs:
        await place_rfqs(cfg)

    # Choice #5.
    # Example code to query user balances with http
    elif answer == question_5_balances:
        resp = query_balances(cfg)
        logger.info("Received {} balance records".format(len(resp.json()["balance_response"])))
        for account in resp.json()["balance_response"]:
            if float(account["cash_balance"]) > 0:
                logger.info("-> Coin {} bal {} with {} for withdrawal".format(account["symbol"], round(float(account["cash_balance"]),4), round(float(account["withdrawable_balance"]),4)))

    # Choice #6.
    # Example code to query server time (UTC) with http
    elif answer == question_6_servertime:
        resp = query_servertime(cfg)
        logger.info("Received response on current Server Time")
        logger.info(resp.json())

    # Choice #7.
    # Example code to query exchange info with http
    elif answer == question_7_exchinfo:
        resp = query_exchangeinfo(cfg)
        logger.info("Found {} symbols in Exchange Info response".format(len(resp.json()["entities_and_rules_response"]["symbols"])))
        with open("exch.json", "w") as file:
            file.write(resp.text)
        logger.info("Wrote Exchange Info response details to file 'exch.json'")

    # Choice #8.
    # Example code to query order book with http
    elif answer == question_8_orderbook:
        resp = query_orderbook(cfg)
        logger.info(resp.json())

    # Invalid choice provided by user - raise Exception
    else:
        logger.error("Invalid choice - {}. Valid choices are from '0' to {} ".format(answer, len(choices)))

    return 0

if __name__ == "__main__":
    asyncio.run(main())
