
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
        "longName": "Call Calendar Spread",
        "shortName": "CCal",
        "legs": [
            {"optionType": "call", "price": "ATM", "ratio": -1},
            {"optionType": "call", "price": "N_ATM", "ratio": 1},
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
        "longName": "Put Calendar Spread",
        "shortName": "PCal",
        "legs": [
            {"optionType": "put", "price": "ATM", "ratio": -1},
            {"optionType": "put", "price": "N_ATM", "ratio": 1},
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
        "longName": "Call Condor",
        "shortName": "CCdr",
        "legs": [
            {"optionType": "call", "price": "X_ITM", "ratio": 1},
            {"optionType": "call", "price": "ITM", "ratio": -1},
            {"optionType": "call", "price": "OTM", "ratio": -1},
            {"optionType": "call", "price": "X_OTM", "ratio": 1},
        ],
    },
    {
        "longName": "Put Condor",
        "shortName": "PCdr",
        "legs": [
            {"optionType": "put", "price": "X_OTM", "ratio": 1},
            {"optionType": "put", "price": "OTM", "ratio": -1},
            {"optionType": "put", "price": "ATM", "ratio": -1},
            {"optionType": "put", "price": "ITM", "ratio": 1},
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
        "longName": "Call Butterfly",
        "shortName": "CFly",
        "legs": [
            {"optionType": "call", "price": "ITM", "ratio": 1},
            {"optionType": "call", "price": "ATM", "ratio": -2},
            {"optionType": "call", "price": "OTM", "ratio": 1},
        ],
    },
    {
        "longName": "Put Butterfly",
        "shortName": "PFly",
        "legs": [
            {"optionType": "put", "price": "OTM", "ratio": 1},
            {"optionType": "put", "price": "ATM", "ratio": -2},
            {"optionType": "put", "price": "ITM", "ratio": 1},
        ],
    },
    {
        "longName": "Call Spread 1x2",
        "shortName": "CSpd12",
        "legs": [
            {"optionType": "call", "price": "ATM", "ratio": 1},
            {"optionType": "call", "price": "OTM", "ratio": -2},
        ],
    },
    {
        "longName": "Call Spread 1x3",
        "shortName": "CSpd13",
        "legs": [
            {"optionType": "call", "price": "ATM", "ratio": 1},
            {"optionType": "call", "price": "OTM", "ratio": -3},
        ],
    },
    {
        "longName": "Put Spread 1x2",
        "shortName": "PSpd12",
        "legs": [
            {"optionType": "put", "price": "OTM", "ratio": -2},
            {"optionType": "put", "price": "ATM", "ratio": 1},
        ],
    },
    {
        "longName": "Put Spread 1x3",
        "shortName": "PSpd13",
        "legs": [
            {"optionType": "put", "price": "OTM", "ratio": -3},
            {"optionType": "put", "price": "ATM", "ratio": 1},
        ],
    }
]

STRATEGIES = []

for strategy in BASE_STRATEGIES:
    legs = strategy["legs"]
    is_structure_atm = any(leg["optionType"] == "call" and leg["price"] == "ATM" for leg in legs) and any(
        leg["optionType"] == "put" and leg["price"] == "ATM" for leg in legs)
    is_multiple_expiry = any(leg["price"].find("N_") >= 0 for leg in legs)

    strategy["fingerprint"] = ("N_" if is_multiple_expiry else "").join([get_leg_fingerprint(
        leg["ratio"], leg["optionType"], is_structure_atm and leg["price"] == "ATM") for leg in legs])

    strategy["inverted_fingerprint"] = ("N_" if is_multiple_expiry else "").join([get_leg_fingerprint(
        leg["ratio"] * -1, leg["optionType"], is_structure_atm and leg["price"] == "ATM") for leg in legs])

    STRATEGIES.append(strategy)
