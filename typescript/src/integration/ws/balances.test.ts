import { test, expect } from '@jest/globals';

import getMarketProxyApi from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';

test('[WS] fetch balances', async () => {
  const api = await getMarketProxyApi(getConfig());
  await api.authenticate();

  const { balances } = await api.balancesWs();

  ['BTC', 'ETH', 'AVAX', 'SOL', 'USD', 'PTF', 'USD-REFERENCE'].forEach((asset) => {
    expect(balances.find((b) => b.symbol === asset)).toBeTruthy();
  });

  await api.close();
}, 10000);
