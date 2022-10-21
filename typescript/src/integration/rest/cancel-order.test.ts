import getMarketProxyApi, { MarketProxyApi } from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';
import { OrderRequest } from '../../market-proxy/types';
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

describe('[REST] Cancel Order', () => {
  let api: MarketProxyApi;

  beforeAll(async () => {
    api = await getMarketProxyApi(getConfig());

    await api.authenticate();
  }, 10000);

  afterAll(async () => {
    await api.cancelAllOpenOrdersRest();
    await api.close();
  });

  test('cancel order by order id and client order id', async () => {
    await api.cancelAllOpenOrdersRest();
    let orders = await api.fetchOpenOrdersRest();

    expect(orders.length).toEqual(0);

    await api.placeBulkOrderWs([
      getOrderBase(),
      { ...getOrderBase(), symbol: 'ETH-USD', quantity: 2, price: 1000 },
      { ...getOrderBase(), symbol: 'PTF-USD', quantity: 1000, price: 0.2 },
    ]);

    while (orders.length !== 3) {
      orders = await api.fetchOpenOrdersRest();
      await sleep(200);
    }

    // By Order Id
    const response = await api.cancelOpenOrderRest({ orderId: orders[0].orderId });

    expect(response).toEqual({
      symbol: orders[0].symbol,
      tradeable_entity_id: orders[0].tradeableEntityId,
      order_id: orders[0].orderId,
      client_order_id: orders[0].clientOrderId,
      timestamp: expect.any(String),
      reason: 'user_cancelled',
    });

    orders = await api.fetchOpenOrdersRest();

    expect(orders.length).toEqual(2);

    // By Client Order Id
    const response2 = await api.cancelOpenOrderRest({ clientOrderId: orders[0].clientOrderId });

    expect(response2).toEqual({
      symbol: orders[0].symbol,
      tradeable_entity_id: orders[0].tradeableEntityId,
      order_id: orders[0].orderId,
      client_order_id: orders[0].clientOrderId,
      timestamp: expect.any(String),
      reason: 'user_cancelled',
    });
  }, 10000);
});
