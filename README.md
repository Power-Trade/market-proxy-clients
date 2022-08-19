# market-proxy-client

A test client showing basic usage of the rest/ws api

## Requirements

**Python 3.10**
This project uses pattern matching, introduced in Python 3.10

## Setup

1. Install requirements with `pip install -r requirements.txt`
2. Run `python main.py path-to-configuration.json`

## Running examples

### Config

To generate your own config, you need to go to PowerTrade's web application:

DEV: https://powertrade-web-dev.web.app/trade/options/BTC/
TEST: https://powertrade-web-test.web.app/trade/options/BTC/
STAGING: https://powertrade-web-staging.web.app/trade/options/BTC/

- Sign up
- Click on the accout profile menu in the top right and choose `API Keys`
- Generate a key to use inside `main.py`
- Fund your account with the `Request Test Assets` item in the same account profile menu

## Documentation

Power Trade's Market Proxy API: https://api-docs-5180b.web.app/

## Application flow

As per `./examples/websocket_rfq.py`

- Connect to the ws endpoint: https://api-docs-5180b.web.app/docs/environments
- Authenticate using your JWT generate from the configuration: https://api-docs-5180b.web.app/docs/web-socket-interface/authenticate-message
- Fetch all of Power Trades tradeable symbols: https://api-docs-5180b.web.app/docs/web-socket-interface/entities-and-rules/entities-and-rules-request
- Listen to RFQs on the platform: https://api-docs-5180b.web.app/docs/web-socket-interface/rfq/register-for-rfq
-

## TODO

### Short-term

- [x] Add basic websocket client which supports authentication
- [x] Support subscribing to RFQ orders (subscription supported, messages not handled gracefully)
- [x] Add basic websocket client example to showcase authentication/rfq subscription)
- [x] Add server order/subscribe messages (includes RFQ).
- [x] Support requesting exchange entities/rules
- [x] Add ws support to place/manage orders

### Long-term

- [ ] Add basic HTTP client
- [ ] Add basic HTTP client usage example
