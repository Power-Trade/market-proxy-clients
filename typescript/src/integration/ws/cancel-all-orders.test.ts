import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';

import getMarketProxyApi, { MarketProxyApi } from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';
import { OrderAcceptedWsRaw, OrderRequest, TradeableEntity } from '../../market-proxy/types';
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

describe('[WS] Cancel All Orders', () => {
  let api: MarketProxyApi;
  let symbols: TradeableEntity[];

  beforeAll(async () => {
    api = await getMarketProxyApi(getConfig());

    await api.authenticate();
    symbols = await api.fetchEntitiesAndRulesWs();
  }, 10000);

  afterAll(async () => {
    await api.close();
  });

  test('cancel all orders', async () => {
    await api.cancelAllOpenOrdersWs();
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
      await sleep(200);
    }

    const response = await api.cancelAllOpenOrdersWs();

    expect(response).toEqual({
      server_utc_timestamp: expect.any(String),
      timestamp: expect.any(String),
      user_tag: expect.any(String),
      reason: 'success',
      results: expect.arrayContaining(
        payload.map((o) => ({
          order_state: 'pending_cancel',
          client_order_id: o.clientOrderId,
        }))
      ),
    });

    while (orders.length !== 0) {
      orders = await api.fetchOpenOrdersRest();
      await sleep(200);
    }
  }, 10000);

  test('cancel all orders for symbol', async () => {
    await api.cancelAllOpenOrdersWs();
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
      await sleep(200);
    }

    const response1 = await api.cancelAllOpenOrdersWs({ symbol: 'BTC-USD' });

    expect(response1).toEqual({
      server_utc_timestamp: expect.any(String),
      timestamp: expect.any(String),
      user_tag: expect.any(String),
      reason: 'success',
      symbol: 'BTC-USD',
      tradeable_entity_id: symbols.find((s) => s.symbol === 'BTC-USD')?.id,
      results: expect.arrayContaining(
        payload.slice(0, 2).map((o) => ({
          order_state: 'pending_cancel',
          client_order_id: o.clientOrderId,
        }))
      ),
    });

    while (orders.length !== 2) {
      orders = await api.fetchOpenOrdersRest();
      await sleep(200);
    }

    const response2 = await api.cancelAllOpenOrdersWs();

    expect(response2.results).toHaveLength(2);

    while (orders.length !== 0) {
      orders = await api.fetchOpenOrdersRest();
      await sleep(200);
    }
  }, 10000);

  test('cancel all orders for tradeable entity id', async () => {
    await api.cancelAllOpenOrdersWs();
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
      await sleep(200);
    }

    const tradeableEntityId = symbols.find((s) => s.symbol === 'BTC-USD')?.id;

    const response1 = await api.cancelAllOpenOrdersWs({ tradeableEntityId });

    expect(response1).toEqual({
      server_utc_timestamp: expect.any(String),
      timestamp: expect.any(String),
      user_tag: expect.any(String),
      reason: 'success',
      symbol: 'BTC-USD',
      tradeable_entity_id: tradeableEntityId,
      results: expect.arrayContaining(
        payload.slice(0, 2).map((o) => ({
          order_state: 'pending_cancel',
          client_order_id: o.clientOrderId,
        }))
      ),
    });

    while (orders.length !== 2) {
      orders = await api.fetchOpenOrdersRest();
      await sleep(200);
    }

    const response2 = await api.cancelAllOpenOrdersWs();

    expect(response2.results).toHaveLength(2);

    while (orders.length !== 0) {
      orders = await api.fetchOpenOrdersRest();
      await sleep(200);
    }
  }, 10000);

  test('cancel pending_new orders', async () => {
    await api.cancelAllOpenOrdersWs();
    let orders = await api.fetchOpenOrdersRest();

    const ordersAlive: OrderAcceptedWsRaw[] = [];
    api.onOrderAccepted((e) => ordersAlive.push(e));

    expect(orders.length).toEqual(0);

    const payload = [
      getOrderBase(),
      { ...getOrderBase(), symbol: 'BTC-USD', quantity: 1, price: 2000 },
      { ...getOrderBase(), symbol: 'BTC-USD', quantity: 1, price: 3000 },
      { ...getOrderBase(), symbol: 'ETH-USD', quantity: 10, price: 100 },
      { ...getOrderBase(), symbol: 'PTF-USD', quantity: 1000, price: 0.01 },
    ];

    // Race-condition, but usually MP should receive "cancel_all" while all orders are in "pending_new" state
    let placementAwait = api.placeBulkOrderWs(payload);
    let cancelAwait = api.cancelAllOpenOrdersWs();

    // Regardless of delays, we should receive at least 5 "order_entered" and "order_cancelled"
    let placement = await placementAwait;
    let cancel = await cancelAwait;

    expect(cancel).toEqual({
      reason: 'success',
      server_utc_timestamp: expect.any(String),
      timestamp: expect.any(String),
      user_tag: expect.any(String),
      results: expect.arrayContaining(
        payload.slice(0, 5).map((o) => ({
          order_state: 'pending_cancel',
          client_order_id: o.clientOrderId,
        }))
      ),
    });

    while (ordersAlive.length !== 5) {
      await sleep(200)
    }

    // There is a race condition, but orders should be cancelled in the end anyway
    do {
      orders = await api.fetchOpenOrdersRest();
      await sleep(50);
    } while (orders.length !== 0)
  }, 10000);
});
