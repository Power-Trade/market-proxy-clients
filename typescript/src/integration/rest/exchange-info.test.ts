import axios from 'axios';
import getMarketProxyApi from '../../market-proxy/api';
import { getConfig, getEnvironment } from '../../market-proxy/base/config';

test('[REST] fetch exchange info', async () => {
  const api = await getMarketProxyApi(getConfig());

  const entities = await api.exchangeInfoRest();

  expect(entities.length).toBeTruthy();

  const env = getEnvironment();

  // Check that the number of entities is the same as pts
  const { data: marketData } = await axios.get(
    `https://api.rest.${env.toLowerCase()}.power.trade/v1/market_data/tradeable_entity/all/summary`
  );

  expect(marketData.length).toBeTruthy();

  expect(marketData.length).toEqual(entities.length);

  await api.close();
}, 10000);
