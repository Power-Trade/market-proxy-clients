import { test } from '@jest/globals';

import getMarketProxyApi from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';
import { sleep } from '../../market-proxy/utils/time';

// Currently broken
test.skip('[WS] subscribe to symbol', async () => {
  const api = await getMarketProxyApi(getConfig());

  await api.subscribeWs({
    symbol: 'BTC-USD',
    interval: 1000,
    type: 'snap_only',
  });

  sleep(100000);
}, 100000);
