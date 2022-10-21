import getMarketProxyApi, { MarketProxyApi } from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';
import { getUserTag } from '../../market-proxy/utils/userTag';

describe('[REST] Get Order Details', () => {
  let api: MarketProxyApi;

  beforeAll(async () => {
    api = await getMarketProxyApi(getConfig());

    await api.authenticate();
  }, 10000);

  afterAll(async () => {
    await api.cancelAllOpenOrdersRest();
    await api.close();
  });

  test('get details by order id and client order id', async () => {
    await api.cancelAllOpenOrdersRest();
    const orders = await api.fetchOpenOrdersRest();

    expect(orders.length).toEqual(0);

    const placedOrder = await api.placeOrderWs({
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

    // By Order Id
    const response = await api.getOrderDetailsRest({ orderId: placedOrder.orderId });

    expect(response).toEqual({
      utc_timestamp: expect.any(String),
      market_id: '0',
      tradeable_entity_id: expect.any(String),
      symbol: 'BTC-USD',
      type: 'LIMIT',
      order_id: placedOrder.orderId,
      client_order_id: placedOrder.clientOrderId,
      quantity: '1',
      price: '10000',
      side: 'buy',
      order_state: 'accepted',
      cancel_state: 'none',
      executions: [],
    });

    // By Client Order Id
    const response2 = await api.getOrderDetailsRest({ clientOrderId: placedOrder.clientOrderId });

    expect(response2).toEqual({
      utc_timestamp: expect.any(String),
      market_id: '0',
      tradeable_entity_id: expect.any(String),
      symbol: 'BTC-USD',
      type: 'LIMIT',
      order_id: placedOrder.orderId,
      client_order_id: placedOrder.clientOrderId,
      quantity: '1',
      price: '10000',
      side: 'buy',
      order_state: 'accepted',
      cancel_state: 'none',
      executions: [],
    });
  }, 10000);

  test('get details executions', async () => {
    await api.cancelAllOpenOrdersRest();
    const orders = await api.fetchOpenOrdersRest();

    expect(orders.length).toEqual(0);

    const placedOrder = await api.placeOrderWs({
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

    const response = await api.getOrderDetailsRest({ clientOrderId: placedOrder.clientOrderId });

    expect(response).toEqual({
      utc_timestamp: expect.any(String),
      market_id: '0',
      tradeable_entity_id: expect.any(String),
      symbol: 'BTC-USD',
      type: 'LIMIT',
      order_id: placedOrder.orderId,
      client_order_id: placedOrder.clientOrderId,
      quantity: '1',
      price: '10000',
      side: 'buy',
      order_state: 'accepted',
      cancel_state: 'none',
      executions: [],
    });
  }, 10000);
});
