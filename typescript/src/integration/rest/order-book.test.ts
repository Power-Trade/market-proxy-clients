import getMarketProxyApi, { MarketProxyApi } from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';
import { TradeableEntity } from '../../market-proxy/types';
import { sortBy } from '../../market-proxy/utils/array';
import { getUserTag } from '../../market-proxy/utils/userTag';

describe('[REST] Order Book', () => {
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

  test('fetches order book', async () => {
    const { symbol } = sortBy(
      entities.filter((s) => s.productType === 'option' && (s.expiryTimeStamp ?? 0) > Date.now()),
      'symbol'
    )[0];

    const orderBook = await api.orderbookRest({ symbol, depth: 10 });

    const initialBuys = orderBook.buy.length;
    const initialSells = orderBook.sell.length;

    await api.placeOrderWs({
      activeCycles: 1,
      clientOrderId: getUserTag(),
      marketType: 'firm',
      orderType: 'Limit',
      price: 10,
      quantity: 1,
      side: 'buy',
      state: 'new',
      timeInForce: 'GTC',
      symbol,
    });

    await api.placeOrderWs({
      activeCycles: 1,
      clientOrderId: getUserTag(),
      marketType: 'firm',
      orderType: 'Limit',
      price: 1000000,
      quantity: 1,
      side: 'sell',
      state: 'new',
      timeInForce: 'GTC',
      symbol,
    });

    const newOrderBook = await api.orderbookRest({ symbol, depth: 10 });

    const buys = newOrderBook.buy.length;
    const sells = newOrderBook.sell.length;

    expect(buys).toEqual(initialBuys + 1);
    expect(sells).toEqual(initialSells + 1);
  });
});
