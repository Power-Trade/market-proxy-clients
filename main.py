import asyncio
import json
import sys
from examples.websocket_rfq import run


def main():
    # Load from a config file
    args = sys.argv
    if len(args) < 2:
        raise RuntimeError("insufficient arguments")

    # cfg file is 2nd arg
    f = open(args[1])
    cfg: dict = json.load(f)
    f.close()

    # assert config has an api_key + private key for JWT generation
    if "api_key" not in cfg:
        raise AssertionError("invalid cfg doesn't contain 'api_key'")
    if "private_key" not in cfg:
        raise AssertionError("invalid cfg doesn't contain 'private_key'")

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    asyncio.ensure_future(run(cfg), loop=loop)
    loop.run_forever()

    return 0


if __name__ == "__main__":
    main()
