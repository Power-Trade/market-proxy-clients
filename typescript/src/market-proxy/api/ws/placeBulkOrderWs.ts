import MarketProxyWs from '../../base/MarketProxyWs';
import { getOrderRequest } from '../../parser/getOrderRequest';
import { OrderRequest } from '../../types';
import { getUserTag } from '../../utils/userTag';

export const placeBulkOrderWs = (ws: MarketProxyWs, orderRequests: OrderRequest[]) => {
  ws.send({
    new_bulk_order: {
      orders: orderRequests.map(getOrderRequest),
      user_tag: getUserTag(),
    },
  });
};
