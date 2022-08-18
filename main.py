import asyncio
from examples.websocket_rfq import run

asyncio.run(run(cfg={
    "api_key": "",
    "private_key": """""",
    "ws_url": "wss://proxy.staging.ptlab.link"
}))
