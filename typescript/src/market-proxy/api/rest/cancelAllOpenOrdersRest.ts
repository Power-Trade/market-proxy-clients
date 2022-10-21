import MarketProxyWs from '../../base/MarketProxyWs';
import { log } from '../../utils/log';

export const cancelAllOpenOrdersRest = async (ws: MarketProxyWs) => {
  const r = await ws.restCall({ url: `${ws.httpUrl}/v1/api/allOrders`, method: 'DELETE' });

  log(r);
};
