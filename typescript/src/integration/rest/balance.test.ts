import getMarketProxyApi from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';

test('[REST] fetch balances', async () => {
  const api = await getMarketProxyApi(getConfig());

  const response = await api.balanceRest();

  expect(response.length).toBeTruthy();
  expect(response.find((b) => b.symbol === 'USD')).toEqual({
    deliverable_id: '2',
    symbol: 'USD',
    cash_balance: expect.any(String),
    available_balance: expect.any(String),
    reserved_balance: expect.any(String),
    timestamp: expect.any(String),
  });

  await api.close();
}, 10000);
