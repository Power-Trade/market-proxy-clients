
def get_leg_fingerprint(ratio: int, optionType: str, is_atm: bool) -> str:
    t = "ATM" if is_atm else ""
    return str(ratio) + t + optionType


BASE_STRATEGIES = [
    {
        "longName": "Call Spread",
        "shortName": "CSpd",
        "legs": [
            {"optionType": "call", "price": "ATM", "ratio": 1},
            {"optionType": "call", "price": "OTM", "ratio": -1},
        ],
    },
    {
        "longName": "Put Spread",
        "shortName": "PSpd",
        "legs": [
            {"optionType": "put", "price": "OTM", "ratio": -1},
            {"optionType": "put", "price": "ATM", "ratio": 1},
        ],
    },
    {
        "longName": "Straddle",
        "shortName": "Strd",
        "legs": [
            {"optionType": "put", "price": "ATM", "ratio": 1},
            {"optionType": "call", "price": "ATM", "ratio": 1},
        ],
    },
    {
        "longName": "Strangle",
        "shortName": "Strg",
        "legs": [
            {"optionType": "put", "price": "OTM", "ratio": 1},
            {"optionType": "call", "price": "OTM", "ratio": 1},
        ],
    },
    {
        "longName": "Risk Reversal",
        "shortName": "RRev",
        "legs": [
            {"optionType": "put", "price": "OTM", "ratio": -1},
            {"optionType": "call", "price": "OTM", "ratio": 1},
        ],
    },
    {
        "longName": "Iron Butterfly",
        "shortName": "IrnFly",
        "legs": [
            {"optionType": "put", "price": "OTM", "ratio": 1},
            {"optionType": "put", "price": "ATM", "ratio": -1},
            {"optionType": "call", "price": "ATM", "ratio": -1},
            {"optionType": "call", "price": "OTM", "ratio": 1},
        ],
    },
    {
        "longName": "Call Condor",
        "shortName": "CCdr",
        "legs": [
            {"optionType": "call", "price": "X_ITM", "ratio": -1},
            {"optionType": "call", "price": "ITM", "ratio": 1},
            {"optionType": "call", "price": "OTM", "ratio": 1},
            {"optionType": "call", "price": "X_OTM", "ratio": -1},
        ],
    },
    {
        "longName": "Iron Condor",
        "shortName": "IrnCdr",
        "legs": [
            {"optionType": "put", "price": "X_OTM", "ratio": 1},
            {"optionType": "put", "price": "OTM", "ratio": -1},
            {"optionType": "call", "price": "OTM", "ratio": -1},
            {"optionType": "call", "price": "X_OTM", "ratio": 1},
        ],
    },
    {
        "longName": "Call Butterfly Spread",
        "shortName": "CFlySpd",
        "legs": [
            {"optionType": "call", "price": "ITM", "ratio": 1},
            {"optionType": "call", "price": "ATM", "ratio": -2},
            {"optionType": "call", "price": "OTM", "ratio": 1},
        ],
    },
    {
        "longName": "Put Butterfly Spread",
        "shortName": "PFlySpd",
        "legs": [
            {"optionType": "put", "price": "OTM", "ratio": 1},
            {"optionType": "put", "price": "ATM", "ratio": -2},
            {"optionType": "put", "price": "ITM", "ratio": 1},
        ],
    }
]

STRATEGIES = []

for strategy in BASE_STRATEGIES:
    legs = strategy["legs"]
    is_structure_atm = any(leg["optionType"] == "call" and leg["price"] == "ATM" for leg in legs) and any(
        leg["optionType"] == "put" and leg["price"] == "ATM" for leg in legs)

    strategy["fingerprint"] = "".join([get_leg_fingerprint(
        leg["ratio"], leg["optionType"], is_structure_atm and leg["price"] == "ATM") for leg in legs])
    strategy["inverted_fingerprint"] = "".join([get_leg_fingerprint(
        leg["ratio"] * -1, leg["optionType"], is_structure_atm and leg["price"] == "ATM") for leg in legs])

    STRATEGIES.append(strategy)
