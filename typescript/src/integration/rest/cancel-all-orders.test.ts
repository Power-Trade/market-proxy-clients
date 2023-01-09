import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';

import getMarketProxyApi, { MarketProxyApi } from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';
import { OrderRequest, TradeableEntity } from '../../market-proxy/types';
import { sleep } from '../../market-proxy/utils/time';
import { getUserTag } from '../../market-proxy/utils/userTag';

const getOrderBase = (): OrderRequest => ({
  activeCycles: 1,
  clientOrderId: getUserTag(),
  marketType: 'firm',
  orderType: 'Limit',
  price: 1000,
  quantity: 1,
  side: 'buy',
  state: 'new',
  timeInForce: 'GTC',
  symbol: 'BTC-USD',
});

describe('[REST] Cancel All Orders', () => {
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

  test('cancel all orders', async () => {
    await api.cancelAllOpenOrdersRest();
    let orders = await api.fetchOpenOrdersRest();

    expect(orders.length).toEqual(0);

    const payload = [
      getOrderBase(),
      { ...getOrderBase(), symbol: 'BTC-USD', quantity: 1, price: 2000 },
      { ...getOrderBase(), symbol: 'BTC-USD', quantity: 1, price: 3000 },
      { ...getOrderBase(), symbol: 'ETH-USD', quantity: 10, price: 100 },
      { ...getOrderBase(), symbol: 'PTF-USD', quantity: 1000, price: 0.01 },
    ];

    await api.placeBulkOrderWs(payload);

    while (orders.length !== 5) {
      orders = await api.fetchOpenOrdersRest();
      await sleep(500);
    }

    const response = await api.cancelAllOpenOrdersRest();

    expect(response).toEqual({
      cancel_all_orders_response: {
        reason: 'success',
        timestamp: expect.any(String),
        user_tag: '',
        results: expect.arrayContaining(
          payload.map(({ clientOrderId }) => ({
            client_order_id: clientOrderId,
            order_state: 'pending_cancel',
          }))
        ),
      },
    });

    while (orders.length !== 0) {
      orders = await api.fetchOpenOrdersRest();
      await sleep(200);
    }
  }, 10000);

  test('cancel all orders by symbol', async () => {
    await api.cancelAllOpenOrdersRest();
    let orders = await api.fetchOpenOrdersRest();

    expect(orders.length).toEqual(0);

    const payload = [
      getOrderBase(),
      { ...getOrderBase(), symbol: 'BTC-USD', quantity: 1, price: 2000 },
      { ...getOrderBase(), symbol: 'BTC-USD', quantity: 1, price: 3000 },
      { ...getOrderBase(), symbol: 'ETH-USD', quantity: 10, price: 100 },
      { ...getOrderBase(), symbol: 'PTF-USD', quantity: 1000, price: 0.01 },
    ];

    await api.placeBulkOrderWs(payload);

    while (orders.length !== 5) {
      orders = await api.fetchOpenOrdersRest();
      await sleep(500);
    }

    const response = await api.cancelAllOpenOrdersRest({ symbol: 'BTC-USD' });

    expect(response).toEqual({
      cancel_all_orders_response: {
        reason: 'success',
        timestamp: expect.any(String),
        user_tag: '',
        tradeable_entity_id: symbols.find((s) => s.symbol === 'BTC-USD')?.id,
        symbol: 'BTC-USD',
        results: expect.arrayContaining(
          payload.slice(0, 2).map(({ clientOrderId }) => ({
            client_order_id: clientOrderId,
            order_state: 'pending_cancel',
          }))
        ),
      },
    });

    while (orders.length !== 2) {
      orders = await api.fetchOpenOrdersRest();
      await sleep(200);
    }

    const response2 = await api.cancelAllOpenOrdersRest();

    expect(response2.cancel_all_orders_response.results.length).toEqual(2);

    while (orders.length !== 0) {
      orders = await api.fetchOpenOrdersRest();
      await sleep(200);
    }
  }, 10000);

  test('cancel all orders by tradeable entity id', async () => {
    await api.cancelAllOpenOrdersRest();
    let orders = await api.fetchOpenOrdersRest();

    expect(orders.length).toEqual(0);

    const payload = [
      getOrderBase(),
      { ...getOrderBase(), symbol: 'BTC-USD', quantity: 1, price: 2000 },
      { ...getOrderBase(), symbol: 'BTC-USD', quantity: 1, price: 3000 },
      { ...getOrderBase(), symbol: 'ETH-USD', quantity: 10, price: 100 },
      { ...getOrderBase(), symbol: 'PTF-USD', quantity: 1000, price: 0.01 },
    ];

    await api.placeBulkOrderWs(payload);

    while (orders.length !== 5) {
      orders = await api.fetchOpenOrdersRest();
      await sleep(500);
    }

    const tradeableEntityId = symbols.find((s) => s.symbol === 'BTC-USD')?.id;

    const response = await api.cancelAllOpenOrdersRest({ tradeable_entity_id: tradeableEntityId });

    expect(response).toEqual({
      cancel_all_orders_response: {
        reason: 'success',
        timestamp: expect.any(String),
        user_tag: '',
        tradeable_entity_id: tradeableEntityId,
        symbol: 'BTC-USD',
        results: expect.arrayContaining(
          payload.slice(0, 2).map(({ clientOrderId }) => ({
            client_order_id: clientOrderId,
            order_state: 'pending_cancel',
          }))
        ),
      },
    });

    while (orders.length !== 2) {
      orders = await api.fetchOpenOrdersRest();
      await sleep(200);
    }

    const response2 = await api.cancelAllOpenOrdersRest();

    expect(response2.cancel_all_orders_response.results.length).toEqual(2);

    while (orders.length !== 0) {
      orders = await api.fetchOpenOrdersRest();
      await sleep(200);
    }
  }, 10000);
});
