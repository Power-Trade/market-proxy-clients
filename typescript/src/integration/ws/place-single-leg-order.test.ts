import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';

import getMarketProxyApi, { MarketProxyApi } from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';
import { OrderRequest, TradeableEntity } from '../../market-proxy/types';
import { getUserTag } from '../../market-proxy/utils/userTag';
import { sleep } from '../../market-proxy/utils/time';

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

describe('[WS] Single Leg Placement', () => {
  let api: MarketProxyApi;
  let entities: TradeableEntity[];

  beforeAll(async () => {
    api = await getMarketProxyApi(getConfig());

    await api.authenticate();

    entities = await api.fetchEntitiesAndRulesWs();
  }, 20000);

  afterAll(async () => {
    await api.cancelAllOpenOrdersRest();
    await api.close();
  });

  test('Single Leg Spot order', async () => {
    const order: OrderRequest = getOrderBase();

    const orderResponse = await api.placeOrderWs(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'accepted',
      timestamp: expect.any(Number),
      orderId: expect.any(String),
    });
  });

  test('Single Leg Spot RFQ', async () => {
    const order: OrderRequest = {
      ...getOrderBase(),
      marketType: 'rfq',
      price: 0,
      quantity: 10,
      side: 'sell',
      symbol: 'ETH-USD',
    };

    const orderResponse = await api.placeOrderWs(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'accepted',
      timestamp: expect.any(Number),
      orderId: expect.any(String),
    });
  });

  test('Single Leg Future order', async () => {
    const symbol = entities.find((s) => ((s.productType === 'future') && (s.expiryTimeStamp! > Date.now())))?.symbol;
    const order: OrderRequest = {
      ...getOrderBase(),
      price: 10000,
      quantity: 0.99,
      symbol,
    };

    const orderResponse = await api.placeOrderWs(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'accepted',
      timestamp: expect.any(Number),
      orderId: expect.any(String),
    });
  });

  test('Single Leg Future RFQ', async () => {
    const symbol = entities.find((s) => ((s.productType === 'future') && (s.expiryTimeStamp! > Date.now())))?.symbol;
    const order: OrderRequest = {
      ...getOrderBase(),
      marketType: 'rfq',
      price: 0,
      quantity: 0.1,
      side: 'sell',
      symbol,
    };

    const orderResponse = await api.placeOrderWs(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'accepted',
      timestamp: expect.any(Number),
      orderId: expect.any(String),
    });
  });

  test('Single Leg Perpetual order', async () => {
    const order: OrderRequest = {
      ...getOrderBase(),
      price: 10000,
      quantity: 1,
      side: 'sell',
      symbol: 'BTC-USD-PERPETUAL',
    };

    const orderResponse = await api.placeOrderWs(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'accepted',
      timestamp: expect.any(Number),
      orderId: expect.any(String),
    });
  });

  test('Single Leg Perpetual RFQ', async () => {
    const order: OrderRequest = {
      ...getOrderBase(),
      marketType: 'rfq',
      price: 0,
      quantity: 3,
      symbol: 'ETH-USD-PERPETUAL',
    };

    const orderResponse = await api.placeOrderWs(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'accepted',
      timestamp: expect.any(Number),
      orderId: expect.any(String),
    });
  });

  test('Single Leg Option order', async () => {
    const symbol = entities.find((s) => ((s.productType === 'option') && (s.expiryTimeStamp! > Date.now())))?.symbol;
    const order: OrderRequest = {
      ...getOrderBase(),
      price: 10000,
      quantity: 1,
      side: 'sell',
      symbol,
    };

    const orderResponse = await api.placeOrderWs(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'accepted',
      timestamp: expect.any(Number),
      orderId: expect.any(String),
    });
  });

  test('Single Leg Option RFQ', async () => {
    const symbol = entities.find((s) => ((s.productType === 'option') && (s.expiryTimeStamp! > Date.now())))?.symbol;
    const order: OrderRequest = {
      ...getOrderBase(),
      marketType: 'rfq',
      price: 0,
      quantity: 5,
      symbol,
    };

    const orderResponse = await api.placeOrderWs(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'accepted',
      timestamp: expect.any(Number),
      orderId: expect.any(String),
    });
  });

  test('Single Leg Perpetual order with expire time', async () => {
    let ordersBegin = await api.fetchOpenOrdersRest();

    // Expire in past
    let order: OrderRequest = {
      ...getOrderBase(),
      symbol: 'BTC-USD-PERPETUAL',
      timeInForce: 'GTD',
      expireTimestamp: (Date.now()-1000) * 1000,
    };

    const orderResponseExpirePast = await api.placeOrderWs(order);

    expect(orderResponseExpirePast).toEqual({
      ...order,
      state: 'rejected',
      orderId: '',
      reason: 'expire_time should be in range [now, +1 year]',
    });

    // Expire in > 1 year
    order = {
      ...getOrderBase(),
      symbol: 'BTC-USD-PERPETUAL',
      timeInForce: 'GTD',
      expireTimestamp: (Date.now()+367*86400*1000) * 1000,
    };

    const orderResponseExpireFar = await api.placeOrderWs(order);

    expect(orderResponseExpireFar).toEqual({
      ...order,
      state: 'rejected',
      orderId: '',
      reason: 'expire_time should be in range [now, +1 year]',
    });

    // Expire soon
    order = {
      ...getOrderBase(),
      symbol: 'BTC-USD-PERPETUAL',
      timeInForce: 'GTD',
      expireTimestamp: (Date.now()+1000) * 1000,
    };

    const orderResponseGood = await api.placeOrderWs(order);

    expect(orderResponseGood).toEqual({
      ...order,
      state: 'accepted',
      timestamp: expect.any(Number),
      orderId: expect.any(String),
    });

    // Wait for expire
    let orders = await api.fetchOpenOrdersRest();
    expect(orders.length).toEqual(ordersBegin.length+1);
    await sleep(2000);
    orders = await api.fetchOpenOrdersRest();
    expect(orders.length).toEqual(ordersBegin.length);
  });
});
