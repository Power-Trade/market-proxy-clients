import { getConfig } from '../../market-proxy/base/config';
import getMarketProxyApi from '../../market-proxy/api';

test('[WS] authenticates with the right credentials works', async () => {
  const config = getConfig();

  const api = await getMarketProxyApi(config);

  expect(api.ws.authenticated).toEqual(false);

  await api.authenticate();

  expect(api.ws.authenticated).toEqual(true);

  await api.close();
});

test('[WS] authenticates with the wrong credentials fails', async () => {
  const config = getConfig();

  config.apiKey = 'f9179d30456b8cb487d08d9fbe9d3e38';
  config.privateKey = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEINTAWBo+sb7T+B7o7T4RhUprvEFvEC/Zsr1FRBF5Vt/moAoGCCqGSM49
AwEHoUQDQgAE6oAXTpdFhK32SOVpHn1t0YwhDJxFG38apXost+wdoZ07AAXZa9is
Io5hH9GM/xRKmAwadUp1jPQpwUjyaEzUvQ==
-----END EC PRIVATE KEY-----
`;

  const api = await getMarketProxyApi(config);

  expect(api.ws.authenticated).toEqual(false);

  await expect(api.authenticate()).rejects.toThrow();

  expect(api.ws.authenticated).toEqual(false);

  await api.close();
});
