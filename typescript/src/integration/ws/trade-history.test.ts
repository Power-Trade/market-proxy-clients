import { expect, test } from '@jest/globals';

import { nanoid } from 'nanoid';
import getMarketProxyApi from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';
import { sleep } from '../../market-proxy/utils/time';

test('[WS] fetch trade history', async () => {
  const api = await getMarketProxyApi(getConfig());
  await api.authenticate();

  // const deliverables = await api.deliverableInfoRest();

  // await api.placeOrderWs({
  //   activeCycles: 1,
  //   clientOrderId: nanoid(),
  //   marketType: 'firm',
  //   orderType: 'Market',
  //   price: 1,
  //   quantity: 0.1,
  //   side: 'sell',
  //   state: 'new',
  //   timeInForce: 'IOC',
  //   symbol: 'BTC-USD-PERPETUAL',
  // });

  // await sleep(500);

  const result = await api.tradeHistoryWs({
    tradeTimestamp: Date.now() - 1000 * 24 * 60 * 60 + '000',
  });

  console.log(result);

  await api.close();
}, 10000);
