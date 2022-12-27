import MarketProxyWs from '../../base/MarketProxyWs';
import { CancelOpenOrdersRestResponseRaw } from '../../types';

export type CancelAllOpenOrdersRestArgs = { symbol?: string; tradeableEntityId?: string };

export const cancelAllOpenOrdersRest = async (
  ws: MarketProxyWs,
  args?: CancelAllOpenOrdersRestArgs
) => {
  const r = await ws.restCall({
    url: `${ws.httpUrl}/v1/api/allOrders`,
    method: 'DELETE',
    data: args,
  });

  return r as CancelOpenOrdersRestResponseRaw;
};
