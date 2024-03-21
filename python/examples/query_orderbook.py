import requests

from utils.access_token import generate_access_token

def query_orderbook(cfg, version = "v1", depth = 100, symbol = "SOL-USD-PERPETUAL"):
    ENDPOINT = "/{}/api/orderbook?depth={}&symbol={}".format(version, depth, symbol)
    token = generate_access_token(cfg["api_key"], cfg["private_key"])
    headers = {'credentials_secret': token}
    return requests.get(cfg["http_url"] + ENDPOINT, headers=headers)
