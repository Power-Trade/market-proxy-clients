import asyncio
from examples.websocket_rfq import run

# Configuration examples
configuration = {
    "DEV": {
        "api_key": "9cfc9c3da4185d8f03d9f7962fec33d6",
        "private_key": """-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIPQ/pSkixlGLBN5F6/hI7KsenK87FHgHG2dH1PQevUSxoAoGCCqGSM49
AwEHoUQDQgAEzi3e/genFNJ7flOwUiuA1j5sv5wvsOhaeX2Wh3O1LOC5AHETJgoM
tAZBmql9DA1hCwb4EIfa5OBdUEBjD3qQYw==
-----END EC PRIVATE KEY-----""",
        "ws_url": "wss://proxy.dev.ptlab.link"
    },
    "TEST": {
        "api_key": "615ebf5163a08d3fc5526c04bb84c337",
        "private_key": """-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIFu4h1DaVWX2IJLqOIFoxx81olmMFhtUXg0trJsSUKULoAoGCCqGSM49
AwEHoUQDQgAEdeLG5CI63O4cBjsXIJc72ExJzciyBOY5nzH4XlT+CmNEp3Z1znwd
Zkfv2Us/xCVFQ9wevr2ws1s/CxV8o+q3cQ==
-----END EC PRIVATE KEY-----""",
        "ws_url": "wss://proxy.test.ptlab.link"
    },
    "STAGING": {
        "api_key": "c2554a11d0f27a9208278ff6649f70eb",
        "private_key": """-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIORjLlCLWeYEa+ucy2QsM2A7Z7DA3WonZOnr/V6EvI6loAoGCCqGSM49
AwEHoUQDQgAELYJenygoIyKZz80PUau/16dlYMWrrAa/FPakMWFJJ+5i49POmcB6
yFMKWFghCx+145ZnWE9rJ7PksEh8szGIzg==
-----END EC PRIVATE KEY-----""",
        "ws_url": "wss://proxy.staging.ptlab.link"
    },
}


def main():
    # Load from a config file
    # args = sys.argv
    # if len(args) < 2:
    #     raise RuntimeError("insufficient arguments")

    # # cfg file is 2nd arg
    # f = open(args[1])
    # cfg: dict = json.load(f)
    # f.close()

    cfg = configuration["DEV"]
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
