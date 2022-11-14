import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';

import getMarketProxyApi, { MarketProxyApi } from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';
import { OrderRequest } from '../../market-proxy/types';
import { getUserTag } from '../../market-proxy/utils/userTag';

describe('[WS] Order Rejection', () => {
  let api: MarketProxyApi;

  beforeAll(async () => {
    api = await getMarketProxyApi(getConfig());

    await api.authenticate();
  }, 10000);

  afterAll(async () => {
    await api.cancelAllOpenOrdersRest();
    await api.close();
  });

  test('Single Leg Spot order', async () => {
    const order: OrderRequest = {
      activeCycles: 1,
      clientOrderId: getUserTag(),
      marketType: 'firm',
      orderType: 'Limit',
      price: 10000,
      quantity: 1000000000,
      side: 'buy',
      state: 'new',
      timeInForce: 'GTC',
      symbol: 'BTC-USD',
    };

    const orderResponse = await api.placeOrderWs(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'rejected',
      timestamp: expect.any(Number),
      orderId: expect.any(String),
      reason: 'quantity_greater_than_maximum_quantity',
    });
  });
});
