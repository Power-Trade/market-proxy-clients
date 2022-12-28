import MarketProxyWs from '../../base/MarketProxyWs';
import { CancelOpenOrdersRestResponseRaw } from '../../types';

export type CancelAllOpenOrdersRestArgs = {
  symbol?: string;
  tradeable_entity_id?: string;
};

export const cancelAllOpenOrdersRest = async (
  ws: MarketProxyWs,
  args?: CancelAllOpenOrdersRestArgs
) => {
  const r = await ws.restCall({
    url: `${ws.httpUrl}/v1/api/allOrders?${new URLSearchParams(args).toString()}`,
    method: 'DELETE',
  });

  return r as CancelOpenOrdersRestResponseRaw;
};
