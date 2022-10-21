import MarketProxyWs from '../../base/MarketProxyWs';

export const authenticate = async (ws: MarketProxyWs) => {
  await ws.authenticate();
};
