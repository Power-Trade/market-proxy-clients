from utils.strategy_detection import get_strategy_name


def test_empty():
    s = get_strategy_name("")
    assert s is None


def test_call_spread():
    s = get_strategy_name("BTC-20220826-22000C@1/BTC-20220826-22500C@-1")
    assert s["longName"] == "Call Spread"
    assert s["shortName"] == "CSpd"


def test_put_spread():
    s = get_strategy_name("ETH-20220826-1700P@-1/ETH-20220826-1750P@1")
    assert s["longName"] == "Put Spread"
    assert s["shortName"] == "PSpd"


def test_stradle():
    s = get_strategy_name("BTC-20220826-22000P@1/BTC-20220826-22000C@1")
    assert s["longName"] == "Straddle"
    assert s["shortName"] == "Strd"


def test_strangle():
    s = get_strategy_name("ETH-20220826-1800C@1/ETH-20220826-1700P@1")
    assert s["longName"] == "Strangle"
    assert s["shortName"] == "Strg"


def test_risk_reversal():
    s = get_strategy_name("ETH-20220826-1800C@1/ETH-20220826-1700P@-1")
    assert s["longName"] == "Risk Reversal"
    assert s["shortName"] == "RRev"


def test_iron_butterfly():
    s = get_strategy_name(
        "BTC-20220826-22000P@1/BTC-20220826-22000C@1/BTC-20220826-21500P@-1/BTC-20220826-22500C@-1")
    assert s["longName"] == "Iron Butterfly"
    assert s["shortName"] == "IrnFly"


def test_call_condor():
    s = get_strategy_name(
        "BTC-20220826-23000C@-1/BTC-20220826-21000C@-1/BTC-20220826-21500C@1/BTC-20220826-22500C@1")
    assert s["longName"] == "Call Condor"
    assert s["shortName"] == "CCdr"


def test_iron_condor():
    s = get_strategy_name(
        "BTC-20220826-23000C@1/BTC-20220826-21000P@1/BTC-20220826-21500P@-1/BTC-20220826-22500C@-1")
    assert s["longName"] == "Iron Condor"
    assert s["shortName"] == "IrnCdr"


def test_call_butterfly_spread():
    s = get_strategy_name(
        "BTC-20220826-22000C@-2/BTC-20220826-21500C@1/BTC-20220826-22500C@1")
    assert s["longName"] == "Call Butterfly Spread"
    assert s["shortName"] == "CFlySpd"


def test_put_butterfly_spread():
    s = get_strategy_name(
        "BTC-20220826-22000P@-2/BTC-20220826-21500P@1/BTC-20220826-22500P@1")
    assert s["longName"] == "Put Butterfly Spread"
    assert s["shortName"] == "PFlySpd"


def test_1_sell_leg_not_put_butterfly_spread():
    s = get_strategy_name(
        "BTC-20220826-22000P@-1/BTC-20220826-21500P@1/BTC-20220826-22500P@1")
    assert s is None
