# market-proxy-client

A test client showing basic usage of the rest/ws api

## Requirements

**Python 3.10**
This project uses pattern matching, introduced in Python 3.10

## Setup

1. Setup a virtual env if wanted
2. Install requirements with `pip install -r requirements.txt`

## Running examples

#### Config
Each example requires a config file to be passed when executed.
The complete config file structure is found below:

``` json
{
  "api_key": "", // e.g. cfab9ba7581377cfc343c22d8d285561
  "private_key": "", // e.g. "-----BEGIN EC PRIVATE KEY-----....-----END EC PRIVATE KEY-----
  "ws_url": "" // e.g. "ws://34.141.36.217:4321"
}
```

Not every example requires all config arguments to be present.
HTTP/REST examples will not require `ws_url` for example.

