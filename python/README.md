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

PRODUCTION: https://app.power.trade/trade/options/BTC/

- Sign up
- Click on the accout profile menu in the top right and choose `API Keys`
- Generate a key to use inside your JSON config file piped inside the app
- Fund your account with the `Request Test Assets` item in the same account profile menu

## Documentation

Power Trade's Market Proxy API: https://api-docs-5180b.web.app/

## Application flows

(Check `./main.py` to see which flow is being executed when you run the app)

1. As per `./examples/listen_and_respond_to_rfqs.py`

- Connect to the ws endpoint: https://api-docs-5180b.web.app/docs/environments
- Authenticate using your JWT generate from the configuration: https://api-docs-5180b.web.app/docs/web-socket-interface/authenticate-message
- Fetch all of Power Trades tradeable symbols: https://api-docs-5180b.web.app/docs/web-socket-interface/entities-and-rules/entities-and-rules-request
- Listen to RFQs on the platform: https://api-docs-5180b.web.app/docs/web-socket-interface/rfq/register-for-rfq
- Respond to an RFQ by placing a firm order with the same structure as the RFQ

2. Place orders and check current positions

- Connect to the ws endpoint: https://api-docs-5180b.web.app/docs/environments
- Authenticate using your JWT generate from the configuration: https://api-docs-5180b.web.app/docs/web-socket-interface/authenticate-message
- Place an Option, a Perpetual and a Spot order https://api-docs-5180b.web.app/docs/web-socket-interface/orders/new-order
- Fetch positions https://api-docs-5180b.web.app/docs/web-socket-interface/positions/position-request

## API JSON Schema

The `./json-schema/` folder contains all of the requests and responses from the Market Proxy. To be used in addition to the documentation.
