import getMarketProxyApi, { MarketProxyApi } from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';
import { OrderRequest, TradeableEntity } from '../../market-proxy/types';
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

describe('[REST] Single Leg Placement', () => {
  let api: MarketProxyApi;
  let entities: TradeableEntity[];

  beforeAll(async () => {
    api = await getMarketProxyApi(getConfig());

    await api.authenticate();

    entities = await api.fetchEntitiesAndRulesWs();
  }, 10000);

  afterAll(async () => {
    await api.cancelAllOpenOrdersRest();
    await api.close();
  });

  test('Single Leg Spot order', async () => {
    const order: OrderRequest = getOrderBase();

    const orderResponse = await api.placeOrderRest(order);

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

    const orderResponse = await api.placeOrderRest(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'accepted',
      timestamp: expect.any(Number),
      orderId: expect.any(String),
    });
  });

  test('Single Leg Future order', async () => {
    const symbol = entities.find((s) => s.productType === 'future')?.symbol;
    const order: OrderRequest = {
      ...getOrderBase(),
      price: 10000,
      quantity: 0.99,
      symbol,
    };

    const orderResponse = await api.placeOrderRest(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'accepted',
      timestamp: expect.any(Number),
      orderId: expect.any(String),
    });
  });

  test('Single Leg Future RFQ', async () => {
    const symbol = entities.find((s) => s.productType === 'future')?.symbol;
    const order: OrderRequest = {
      ...getOrderBase(),
      marketType: 'rfq',
      price: 0,
      quantity: 0.1,
      side: 'sell',
      symbol,
    };

    const orderResponse = await api.placeOrderRest(order);

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

    const orderResponse = await api.placeOrderRest(order);

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

    const orderResponse = await api.placeOrderRest(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'accepted',
      timestamp: expect.any(Number),
      orderId: expect.any(String),
    });
  });

  test('Single Leg Option order', async () => {
    const symbol = entities.find((s) => s.productType === 'option')?.symbol;
    const order: OrderRequest = {
      ...getOrderBase(),
      price: 10000,
      quantity: 1,
      side: 'sell',
      symbol,
    };

    const orderResponse = await api.placeOrderRest(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'accepted',
      timestamp: expect.any(Number),
      orderId: expect.any(String),
    });
  });

  test('Single Leg Option RFQ', async () => {
    const symbol = entities.find((s) => s.productType === 'option')?.symbol;
    const order: OrderRequest = {
      ...getOrderBase(),
      marketType: 'rfq',
      price: 0,
      quantity: 5,
      symbol,
    };

    const orderResponse = await api.placeOrderRest(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'accepted',
      timestamp: expect.any(Number),
      orderId: expect.any(String),
    });
  });
});
