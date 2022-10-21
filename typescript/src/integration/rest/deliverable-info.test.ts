import axios from 'axios';
import getMarketProxyApi from '../../market-proxy/api';
import { getConfig, getEnvironment } from '../../market-proxy/base/config';

test('[REST] fetch deliverable info', async () => {
  const api = await getMarketProxyApi(getConfig());

  const deliverables = await api.deliverableInfoRest();

  expect(deliverables.length).toBeTruthy();

  const env = getEnvironment();

  // Check that the number of entities is the same as pts
  const { data: marketData } = await axios.get(
    `https://api.rest.${env.toLowerCase()}.power.trade/v1/market_data/tradeable_entity/all/summary`
  );

  expect(marketData.length).toBeTruthy();

  expect(marketData.length).toBeLessThanOrEqual(deliverables.length);

  await api.close();
}, 10000);
