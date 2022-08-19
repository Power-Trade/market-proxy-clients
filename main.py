import asyncio
from examples.websocket_rfq import run

asyncio.run(run(cfg={
    "api_key": "c2554a11d0f27a9208278ff6649f70eb",
    "private_key": """-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIORjLlCLWeYEa+ucy2QsM2A7Z7DA3WonZOnr/V6EvI6loAoGCCqGSM49
AwEHoUQDQgAELYJenygoIyKZz80PUau/16dlYMWrrAa/FPakMWFJJ+5i49POmcB6
yFMKWFghCx+145ZnWE9rJ7PksEh8szGIzg==
-----END EC PRIVATE KEY-----""",
    "ws_url": "wss://proxy.staging.ptlab.link"
}))
