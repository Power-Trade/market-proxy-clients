import MarketProxyWs from '../../base/MarketProxyWs';
import { PositionsWsResponseRaw } from '../../types';

export const positionsWs = async (ws: MarketProxyWs) => {
  const [, payload] = await ws.sendTaggedRequest('positions');

  return payload as PositionsWsResponseRaw;
};
