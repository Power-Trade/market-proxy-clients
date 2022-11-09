import { expect, test } from '@jest/globals';

import axios from 'axios';
import getMarketProxyApi from '../../market-proxy/api';
import { getConfig, getEnvironment } from '../../market-proxy/base/config';
import { sleep } from '../../market-proxy/utils/time';

// Currently broken
test.skip('[WS] subscribe to symbol', async () => {
  const api = await getMarketProxyApi(getConfig());

  const unsubscribe = await api.subscribeWs({
    symbol: 'BTC-USD',
    interval: 1000,
    type: 'snap_only',
    onSnapshot: console.log,
  });

  sleep(100000);

  unsubscribe();
}, 100000);
