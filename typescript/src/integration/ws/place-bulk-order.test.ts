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
  price: 100,
  quantity: 1,
  side: 'buy',
  state: 'new',
  timeInForce: 'GTC',
  symbol: 'BTC-USD',
});

describe('[WS] Single Leg Placement', () => {
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

  test('Bulk of Single Leg Spot orders', async () => {
    await api.cancelAllOpenOrdersRest();
    let orders = await api.fetchOpenOrdersRest();

    while (orders.length !== 0) {
      await api.cancelAllOpenOrdersRest();
      orders = await api.fetchOpenOrdersRest();
      await sleep(200);
    }

    await api.placeBulkOrderWs([
      getOrderBase(),
      { ...getOrderBase(), symbol: 'ETH-USD', quantity: 2, price: 100 },
      { ...getOrderBase(), symbol: 'PTF-USD', quantity: 1000, price: 0.01 },
    ]);

    while (orders.length < 3) {
      orders = await api.fetchOpenOrdersRest();
      await sleep(200);
    }

    expect(orders).toContainEqual({
      cancelState: 'none',
      clientOrderId: expect.any(String),
      executions: [],
      orderId: expect.any(String),
      orderState: 'accepted',
      price: 0.01,
      quantity: 1000,
      side: 'buy',
      symbol: 'PTF-USD',
      tradeableEntityId: symbols.find((s) => s.symbol === 'PTF-USD')?.id,
      marketType: 'firm',
      isMultiLeg: false,
      isMarketProxyOrder: true,
    });

    expect(orders).toContainEqual({
      cancelState: 'none',
      clientOrderId: expect.any(String),
      executions: [],
      orderId: expect.any(String),
      orderState: 'accepted',
      price: 100,
      quantity: 2,
      side: 'buy',
      symbol: 'ETH-USD',
      tradeableEntityId: symbols.find((s) => s.symbol === 'ETH-USD')?.id,
      marketType: 'firm',
      isMultiLeg: false,
      isMarketProxyOrder: true,
    });

    expect(orders).toContainEqual({
      cancelState: 'none',
      clientOrderId: expect.any(String),
      executions: [],
      orderId: expect.any(String),
      orderState: 'accepted',
      price: 100,
      quantity: 1,
      side: 'buy',
      symbol: 'BTC-USD',
      tradeableEntityId: symbols.find((s) => s.symbol === 'BTC-USD')?.id,
      marketType: 'firm',
      isMultiLeg: false,
      isMarketProxyOrder: true,
    });

    await api.cancelAllOpenOrdersRest();
  }, 10000);

  test('Bulk of Single Leg orders and RFQs', async () => {
    await api.cancelAllOpenOrdersRest();
    let orders = await api.fetchOpenOrdersRest();

    expect(orders.length).toEqual(0);

    const { symbol: futureSymbol, id: futureTeId } = symbols.find(
      (s) => s.productType === 'future'
    )!;
    const { symbol: optionSymbol, id: optionTeId } = symbols.find(
      (s) => s.productType === 'option'
    )!;
    const perpTeId = symbols.find((s) => s.symbol === 'BTC-USD-PERPETUAL')!.id;

    await api.placeBulkOrderWs([
      {
        ...getOrderBase(),
        symbol: futureSymbol,
        tradeableEntityId: undefined,
      },
      {
        ...getOrderBase(),
        symbol: undefined,
        tradeableEntityId: optionTeId,
      },
      {
        ...getOrderBase(),
        symbol: 'BTC-USD-PERPETUAL',
        tradeableEntityId: undefined,
      },
      {
        ...getOrderBase(),
        symbol: undefined,
        tradeableEntityId: futureTeId,
        marketType: 'rfq',
        price: 0,
      },
      {
        ...getOrderBase(),
        symbol: optionSymbol,
        tradeableEntityId: undefined,
        marketType: 'rfq',
        price: 0,
      },
      {
        ...getOrderBase(),
        symbol: undefined,
        tradeableEntityId: perpTeId,
        marketType: 'rfq',
        price: 0,
      },
    ]);

    while (orders.length < 6) {
      orders = await api.fetchOpenOrdersRest();
      await sleep(200);
    }

    expect(orders).toContainEqual({
      cancelState: 'none',
      clientOrderId: expect.any(String),
      executions: [],
      isMarketProxyOrder: true,
      isMultiLeg: false,
      legs: undefined,
      marketType: 'rfq',
      orderId: expect.any(String),
      orderState: 'accepted',
      price: NaN,
      quantity: 1,
      side: 'buy',
      symbol: optionSymbol,
      tradeableEntityId: optionTeId,
    });

    expect(orders).toContainEqual({
      cancelState: 'none',
      clientOrderId: expect.any(String),
      executions: [],
      isMarketProxyOrder: true,
      isMultiLeg: false,
      legs: undefined,
      marketType: 'rfq',
      orderId: expect.any(String),
      orderState: 'accepted',
      price: NaN,
      quantity: 1,
      side: 'buy',
      symbol: futureSymbol,
      tradeableEntityId: futureTeId,
    });

    expect(orders).toContainEqual({
      cancelState: 'none',
      clientOrderId: expect.any(String),
      executions: [],
      isMarketProxyOrder: true,
      isMultiLeg: false,
      legs: undefined,
      marketType: 'firm',
      orderId: expect.any(String),
      orderState: 'accepted',
      price: 100,
      quantity: 1,
      side: 'buy',
      symbol: 'BTC-USD-PERPETUAL',
      tradeableEntityId: perpTeId,
    });

    expect(orders).toContainEqual({
      cancelState: 'none',
      clientOrderId: expect.any(String),
      executions: [],
      isMarketProxyOrder: true,
      isMultiLeg: false,
      legs: undefined,
      marketType: 'rfq',
      orderId: expect.any(String),
      orderState: 'accepted',
      price: NaN,
      quantity: 1,
      side: 'buy',
      symbol: 'BTC-USD-PERPETUAL',
      tradeableEntityId: perpTeId,
    });

    expect(orders).toContainEqual({
      cancelState: 'none',
      clientOrderId: expect.any(String),
      executions: [],
      isMarketProxyOrder: true,
      isMultiLeg: false,
      legs: undefined,
      marketType: 'firm',
      orderId: expect.any(String),
      orderState: 'accepted',
      price: 100,
      quantity: 1,
      side: 'buy',
      symbol: optionSymbol,
      tradeableEntityId: optionTeId,
    });

    expect(orders).toContainEqual({
      cancelState: 'none',
      clientOrderId: expect.any(String),
      executions: [],
      isMarketProxyOrder: true,
      isMultiLeg: false,
      legs: undefined,
      marketType: 'firm',
      orderId: expect.any(String),
      orderState: 'accepted',
      price: 100,
      quantity: 1,
      side: 'buy',
      symbol: futureSymbol,
      tradeableEntityId: futureTeId,
    });
  }, 15000);
});
