import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';

import getMarketProxyApi, { MarketProxyApi } from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';
import { ExecutionRaw, OrderRequest, TradeableEntity } from '../../market-proxy/types';
import { sleep } from '../../market-proxy/utils/time';
import { getUserTag } from '../../market-proxy/utils/userTag';

const getOrderBase = (): OrderRequest => ({
  activeCycles: 1,
  clientOrderId: getUserTag(),
  marketType: 'firm',
  orderType: 'Limit',
  price: 10,
  quantity: 1,
  side: 'buy',
  state: 'new',
  timeInForce: 'GTC',
  symbol: 'AVAX-USD',
});

describe('[WS] Order Executions', () => {
  let api: MarketProxyApi;
  let symbols: TradeableEntity[];

  beforeAll(async () => {
    api = await getMarketProxyApi(getConfig());

    await api.authenticate();
    symbols = await api.fetchEntitiesAndRulesWs();
  }, 10000);

  afterAll(async () => {
    await api.cancelAllOpenOrdersRest();
    await api.close();
  });

  test('AVAX-USD executions', async () => {
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

    expect(executions).toEqual(
      expect.arrayContaining([
        {
          client_order_id: expect.any(String),
          executed_price: '10.0',
          executed_quantity: '0.1',
          liquidity_flag: 'added',
          order_id: expect.any(String),
          order_state: 'partial_fill',
          price: '10',
          server_utc_timestamp: expect.any(String),
          side: 'buy',
          symbol: 'AVAX-USD',
          trade_id: expect.any(String),
          tradeable_entity_id: '930',
          utc_timestamp: expect.any(String),
        },
        {
          client_order_id: expect.any(String),
          executed_price: '10.0',
          executed_quantity: '0.1',
          liquidity_flag: 'taken',
          order_id: expect.any(String),
          order_state: 'filled',
          price: '10',
          server_utc_timestamp: expect.any(String),
          side: 'sell',
          symbol: 'AVAX-USD',
          trade_id: expect.any(String),
          tradeable_entity_id: '930',
          utc_timestamp: expect.any(String),
        },
        {
          client_order_id: expect.any(String),
          executed_price: '10.0',
          executed_quantity: '0.05',
          liquidity_flag: 'added',
          order_id: expect.any(String),
          order_state: 'partial_fill',
          price: '10',
          server_utc_timestamp: expect.any(String),
          side: 'buy',
          symbol: 'AVAX-USD',
          trade_id: expect.any(String),
          tradeable_entity_id: '930',
          utc_timestamp: expect.any(String),
        },
        {
          client_order_id: expect.any(String),
          executed_price: '10.0',
          executed_quantity: '0.05',
          liquidity_flag: 'taken',
          order_id: expect.any(String),
          order_state: 'filled',
          price: '10',
          server_utc_timestamp: expect.any(String),
          side: 'sell',
          symbol: 'AVAX-USD',
          trade_id: expect.any(String),
          tradeable_entity_id: '930',
          utc_timestamp: expect.any(String),
        },
      ])
    );
  });
});
