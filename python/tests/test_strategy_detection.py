from utils.strategy_detection import get_strategy_name


def test_empty():
    s = get_strategy_name("")
    assert s is None


def test_call_cal():
    s = get_strategy_name("BTC-20221028-22000C@-1/BTC-20221104-22500C@1")
    assert s["longName"] == "Call Calendar Spread"
    assert s["shortName"] == "CCal"
    assert s["inverted"] == False

    s = get_strategy_name("BTC-20221028-22000C@1/BTC-20221104-22500C@-1")
    assert s["longName"] == "Call Calendar Spread"
    assert s["shortName"] == "CCal"
    assert s["inverted"] == True


def test_put_cal():
    s = get_strategy_name("ETH-20221028-1700P@-1/ETH-20221104-1750P@1")
    assert s["longName"] == "Put Calendar Spread"
    assert s["shortName"] == "PCal"
    assert s["inverted"] == False

    s = get_strategy_name("ETH-20221028-1700P@1/ETH-20221104-1750P@-1")
    assert s["longName"] == "Put Calendar Spread"
    assert s["shortName"] == "PCal"
    assert s["inverted"] == True


def test_call_spread():
    s = get_strategy_name("BTC-20220826-22000C@1/BTC-20220826-22500C@-1")
    assert s["longName"] == "Call Spread"
    assert s["shortName"] == "CSpd"
    assert s["inverted"] == False

    s = get_strategy_name("BTC-20220826-22000C@-1/BTC-20220826-22500C@1")
    assert s["longName"] == "Call Spread"
    assert s["shortName"] == "CSpd"
    assert s["inverted"] == True


def test_put_spread():
    s = get_strategy_name("ETH-20220826-1700P@-1/ETH-20220826-1750P@1")
    assert s["longName"] == "Put Spread"
    assert s["shortName"] == "PSpd"
    assert s["inverted"] == False

    s = get_strategy_name("ETH-20220826-1700P@1/ETH-20220826-1750P@-1")
    assert s["longName"] == "Put Spread"
    assert s["shortName"] == "PSpd"
    assert s["inverted"] == True


def test_stradle():
    s = get_strategy_name("BTC-20220826-22000P@1/BTC-20220826-22000C@1")
    assert s["longName"] == "Straddle"
    assert s["shortName"] == "Strd"
    assert s["inverted"] == False


def test_strangle():
    s = get_strategy_name("ETH-20220826-1800C@1/ETH-20220826-1700P@1")
    assert s["longName"] == "Strangle"
    assert s["shortName"] == "Strg"
    assert s["inverted"] == False


def test_risk_reversal():
    s = get_strategy_name("ETH-20220826-1800C@1/ETH-20220826-1700P@-1")
    assert s["longName"] == "Risk Reversal"
    assert s["shortName"] == "RRev"
    assert s["inverted"] == False


def test_call_condor():
    s = get_strategy_name(
        "BTC-20221230-17000C@-1/BTC-20221230-16000C@1/BTC-20221230-16500C@-1/BTC-20221230-17500C@1")
    assert s["longName"] == "Call Condor"
    assert s["shortName"] == "CCdr"
    assert s["inverted"] == False

    s = get_strategy_name(
        "BTC-20221230-17000C@1/BTC-20221230-16000C@-1/BTC-20221230-16500C@1/BTC-20221230-17500C@-1")
    assert s["longName"] == "Call Condor"
    assert s["shortName"] == "CCdr"
    assert s["inverted"] == True


def test_put_condor():
    s = get_strategy_name(
        "BTC-20221230-17000P@-1/BTC-20221230-16000P@1/BTC-20221230-16500P@-1/BTC-20221230-17500P@1")
    assert s["longName"] == "Put Condor"
    assert s["shortName"] == "PCdr"
    assert s["inverted"] == False


def test_call_butterfly():
    s = get_strategy_name(
        "BTC-20220826-22000C@-2/BTC-20220826-21500C@1/BTC-20220826-22500C@1")
    assert s["longName"] == "Call Butterfly"
    assert s["shortName"] == "CFly"
    assert s["inverted"] == False


def test_put_butterfly():
    s = get_strategy_name(
        "BTC-20220826-22000P@-2/BTC-20220826-21500P@1/BTC-20220826-22500P@1")
    assert s["longName"] == "Put Butterfly"
    assert s["shortName"] == "PFly"
    assert s["inverted"] == False


def test_iron_butterfly():
    s = get_strategy_name(
        "BTC-20221230-17000P@-1/BTC-20221230-17000C@-1/BTC-20221230-16500P@1/BTC-20221230-17500C@1")
    assert s["longName"] == "Iron Butterfly"
    assert s["shortName"] == "IrnFly"
    assert s["inverted"] == False

    s = get_strategy_name(
        "BTC-20221230-17000P@-2/BTC-20221230-17000C@-1/BTC-20221230-16500P@1/BTC-20221230-17500C@1")
    assert s is None


def test_iron_condor():
    s = get_strategy_name(
        "BTC-20221230-18000C@1/BTC-20221230-16000P@1/BTC-20221230-16500P@-1/BTC-20221230-17500C@-1")
    assert s["longName"] == "Iron Condor"
    assert s["shortName"] == "IrnCdr"
    assert s["inverted"] == False

    s = get_strategy_name(
        "BTC-20221230-18000C@2/BTC-20221230-16000P@1/BTC-20221230-16500P@-1/BTC-20221230-17500C@-1")
    assert s is None


def test_1_sell_leg_not_put_butterfly_spread():
    s = get_strategy_name(
        "BTC-20220826-22000P@-1/BTC-20220826-21500P@1/BTC-20220826-22500P@1")
    assert s is None
