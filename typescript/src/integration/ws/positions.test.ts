import { expect, test } from '@jest/globals';

import { nanoid } from 'nanoid';
import getMarketProxyApi from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';
import { sleep } from '../../market-proxy/utils/time';

test('[WS] fetch positions', async () => {
  const api = await getMarketProxyApi(getConfig());
  await api.authenticate();

  const deliverables = await api.deliverableInfoRest();

  await api.placeOrderWs({
    activeCycles: 1,
    clientOrderId: nanoid(),
    marketType: 'firm',
    orderType: 'Market',
    price: 1,
    quantity: 0.1,
    side: 'sell',
    state: 'new',
    timeInForce: 'IOC',
    symbol: 'BTC-USD-PERPETUAL',
  });

  await sleep(500);

  const { positions } = await api.positionsWs();

  expect(positions.length).toBeTruthy();
  expect(positions.find((p) => p.symbol === 'BTC-USD-PERPETUAL')).toBeTruthy();
  expect(positions.find((p) => p.symbol === 'BTC-USD-PERPETUAL')).toEqual({
    symbol: 'BTC-USD-PERPETUAL',
    deliverable_id: deliverables.find((d) => d.symbol === 'BTC-USD-PERPETUAL')?.deliverable_id,
    product_type: 'perpetual_future',
    timestamp: expect.any(String),
    margin_value: expect.any(String),
    side: expect.any(String),
    size: expect.any(String),
    mark_price: expect.any(String),
    average_entry_price: expect.any(String),
    upnl: expect.any(String),
  });

  await api.close();
}, 10000);
