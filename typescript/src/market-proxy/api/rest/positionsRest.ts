import MarketProxyWs from '../../base/MarketProxyWs';
import { PositionRaw } from '../../types';

export const positionsRest = async (ws: MarketProxyWs): Promise<PositionRaw[]> => {
  const response = (await ws.restCall({
    url: `${ws.httpUrl}/v1/api/positions`,
    method: 'GET',
  })) as { positions_response: { positions: PositionRaw[] } };

  return response.positions_response.positions;
};
