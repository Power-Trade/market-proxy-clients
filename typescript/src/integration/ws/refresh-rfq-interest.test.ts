import getMarketProxyApi, { MarketProxyApi } from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';
import { getUserTag } from '../../market-proxy/utils/userTag';

describe('[WS] Refresh RFQ Interest', () => {
  let api: MarketProxyApi;

  beforeAll(async () => {
    api = await getMarketProxyApi(getConfig());

    await api.authenticate();
  }, 10000);

  afterAll(async () => {
    await api.cancelAllOpenOrdersRest();
    await api.close();
  });

  test('refresh by order id and client order id', async () => {
    const order = await api.placeOrderWs({
      activeCycles: 1,
      clientOrderId: getUserTag(),
      marketType: 'rfq',
      orderType: 'Limit',
      price: 10000,
      quantity: 1,
      side: 'buy',
      state: 'new',
      timeInForce: 'GTC',
      symbol: 'BTC-USD',
    });

    // By Order Id
    const response = await api.refreshRfqInterestWs({ orderId: order.orderId });

    expect(response).toEqual({
      order_id: order.orderId,
      client_order_id: '',
      server_utc_timestamp: expect.any(String),
      user_tag: expect.any(String),
      reason: 'success',
    });

    // By Client Order Id
    const response2 = await api.refreshRfqInterestWs({ clientOrderId: order.clientOrderId });

    expect(response2).toEqual({
      order_id: '',
      client_order_id: order.clientOrderId,
      server_utc_timestamp: expect.any(String),
      user_tag: expect.any(String),
      reason: 'success',
    });
  }, 10000);
});
