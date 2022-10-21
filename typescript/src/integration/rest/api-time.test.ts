import getMarketProxyApi from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';

test('[REST] fetch api time', async () => {
  const api = await getMarketProxyApi(getConfig());

  const response = await api.apiTimeRest();

  expect(response).toEqual({
    serverUtcTimestamp: expect.any(String),
  });

  api.close();
});
