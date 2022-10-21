import MarketProxyWs from '../../base/MarketProxyWs';
import { DeliverableInfoRaw } from '../../types';

export const deliverableInfoRest = async (ws: MarketProxyWs): Promise<DeliverableInfoRaw[]> => {
  const response = (await ws.restCall({
    url: `${ws.httpUrl}/v1/api/deliverableInfo`,
    method: 'GET',
  })) as { deliverables_response: { deliverables: DeliverableInfoRaw[] } };

  return response.deliverables_response.deliverables;
};
