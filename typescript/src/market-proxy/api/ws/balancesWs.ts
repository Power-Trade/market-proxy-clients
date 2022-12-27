import MarketProxyWs from '../../base/MarketProxyWs';
import { BalancesWsResponseRaw } from '../../types';

export const balancesWs = async (ws: MarketProxyWs) => {
  const [, payload] = await ws.sendTaggedRequest('balances');

  return payload as BalancesWsResponseRaw;
};
