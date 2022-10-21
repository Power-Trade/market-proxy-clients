import jwt

import utils.time


def generate_access_token(api_key, private_key):
    now = utils.time.time_s()
    # Generate JWT with 1 min expiry
    # All PowerTrade api keys use the same algo 'ES256'
    return jwt.encode({"exp": now + 60, "iat": now,
                       "sub": api_key, "client": "api"}, private_key, algorithm="ES256")
