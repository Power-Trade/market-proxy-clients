

import operator

from utils.strategies import get_leg_fingerprint, STRATEGIES


def leg_from_string(legString: str):
    symbol, ratio = legString.split("@")
    parts = symbol.split("-")
    base = {"symbol": symbol, "ratio": int(ratio), "currency": parts[0]}

    if len(parts) == 3:
        if parts[2] == 'PERPETUAL':
            base["productType"] = 'perpetual'

            return base
        else:
            base["expiry"] = parts[1]
            base["optionType"] = "call" if parts[2].endswith("C") else "put"
            base["productType"] = 'option'
            base["strike"] = parts[2][:-1]

            return base
    elif len(parts) == 2:
        if parts[1] == "USD":
            base["productType"] = 'spot'

            return base
        else:
            base["expiry"] = parts[1]
            base["productType"] = 'future'

            return base
    else:
        return None


def get_mid_strike(legs):
    strikes = [leg["strike"] for leg in legs]

    for idx, x in enumerate(strikes):
        if idx > 0 and strikes[idx - 1] == x:
            return strikes[idx - 1]

    return 0


def get_strategy_name(symbol: str):
    if not symbol:
        return None

    legs = list(map(leg_from_string, symbol.split("/")))
    is_multiple_expiry = any(leg["expiry"] != legs[0]["expiry"] for leg in legs)

    # Check that we only have option legs
    for leg in legs:
        if leg is None or leg["productType"] != "option" or leg["strike"] is None:
            return None

    # order by option type desc and strike asc
    legs.sort(key=operator.itemgetter('strike'))
    legs.sort(key=operator.itemgetter('optionType'), reverse=True)

    at_the_mid_strike = get_mid_strike(legs)
    is_call_at_the_mid = False
    is_put_at_the_mid = False

    for leg in legs:
        if leg["optionType"] == "call" and leg["strike"] == at_the_mid_strike:
            is_call_at_the_mid = True
        if leg["optionType"] == "put" and leg["strike"] == at_the_mid_strike:
            is_put_at_the_mid = True

    is_structure_at_the_mid = at_the_mid_strike != 0 and is_call_at_the_mid and is_put_at_the_mid
    fingerprint = ("N_" if is_multiple_expiry else "").join([get_leg_fingerprint(
        leg["ratio"], leg["optionType"], is_structure_at_the_mid and leg["strike"] == at_the_mid_strike) for leg in legs])

    strategy = next((s for s in STRATEGIES if s["fingerprint"]
                    == fingerprint or s["inverted_fingerprint"] == fingerprint), None)

    if strategy is None:
        return None

    return {"longName": strategy["longName"], "shortName": strategy["shortName"], "inverted": strategy["fingerprint"] == fingerprint}
