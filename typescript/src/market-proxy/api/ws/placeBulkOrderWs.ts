import MarketProxyWs from '../../base/MarketProxyWs';
import { getOrderRequest } from '../../parser/getOrderRequest';
import { BulkOrderWsResponseRaw, OrderRequest } from '../../types';

export const placeBulkOrderWs = async (ws: MarketProxyWs, orderRequests: OrderRequest[]) => {
  const [, response] = await ws.sendTaggedRequest('new_bulk_order', {
    orders: orderRequests.map(getOrderRequest),
  });

  return response as BulkOrderWsResponseRaw;
};
