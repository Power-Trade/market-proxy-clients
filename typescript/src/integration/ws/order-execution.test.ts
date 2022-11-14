import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';

import getMarketProxyApi, { MarketProxyApi } from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';
import { ExecutionRaw, OrderRequest } from '../../market-proxy/types';
import { sleep } from '../../market-proxy/utils/time';
import { getUserTag } from '../../market-proxy/utils/userTag';

const getOrderBase = (): OrderRequest => ({
  activeCycles: 1,
  clientOrderId: getUserTag(),
  marketType: 'firm',
  orderType: 'Limit',
  price: 10000,
  quantity: 1,
  side: 'buy',
  state: 'new',
  timeInForce: 'GTC',
  symbol: 'BTC-USD',
});

describe('[WS] Order Executions', () => {
  let api: MarketProxyApi;

  beforeAll(async () => {
    api = await getMarketProxyApi(getConfig());

    await api.authenticate();
  }, 10000);

  afterAll(async () => {
    await api.cancelAllOpenOrdersRest();
    await api.close();
  });

  test('BTC-USD executions', async () => {
    const executions: ExecutionRaw[] = [];

    api.onExecution((e) => executions.push(e));

    const order: OrderRequest = getOrderBase();

    await api.placeOrderWs(order);

    await api.placeOrderWs({
      ...getOrderBase(),
      quantity: 0.1,
      side: 'sell',
    });

    await api.placeOrderWs({
      ...getOrderBase(),
      quantity: 0.05,
      side: 'sell',
    });

    await sleep(3000);

    expect(executions).toEqual([
      {
        server_utc_timestamp: expect.any(String),
        utc_timestamp: expect.any(String),
        tradeable_entity_id: '4',
        symbol: 'BTC-USD',
        trade_id: expect.any(String),
        order_id: expect.any(String),
        client_order_id: expect.any(String),
        executed_price: expect.any(String),
        executed_quantity: '0.1',
        liquidity_flag: 'taken',
        price: '10000',
        side: 'sell',
        order_state: 'filled',
      },
      {
        server_utc_timestamp: expect.any(String),
        utc_timestamp: expect.any(String),
        tradeable_entity_id: '4',
        symbol: 'BTC-USD',
        trade_id: expect.any(String),
        order_id: expect.any(String),
        client_order_id: expect.any(String),
        executed_price: expect.any(String),
        executed_quantity: '0.05',
        liquidity_flag: 'taken',
        price: '10000',
        side: 'sell',
        order_state: 'filled',
      },
    ]);
  });
});
