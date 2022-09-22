import requests

from utils.access_token import generate_access_token


def query_positions(cfg):
    token = generate_access_token(cfg["api_key"], cfg["private_key"])
    headers = {'credentials_secret': token}
    r = requests.get(cfg["http_url"] + "/v1/api/positions", headers=headers)
    print(r.text)
