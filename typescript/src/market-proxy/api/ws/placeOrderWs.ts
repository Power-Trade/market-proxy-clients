import MarketProxyWs from '../../base/MarketProxyWs';
import { getOrderRequest } from '../../parser/getOrderRequest';
import { OrderRequest } from '../../types';
import { log } from '../../utils/log';
import { getUserTag } from '../../utils/userTag';

export const placeOrderWs = async (ws: MarketProxyWs, order: OrderRequest) => {
  const [responseName, payload] = await ws.sendClientOrderIdRequest('new_order', {
    ...getOrderRequest(order),
    user_tag: getUserTag(),
  });

  log(payload);

  if (responseName === 'order_accepted') {
    return {
      ...order,
      orderId: payload.order_id as string,
      state: 'accepted',
      timestamp: parseInt(payload.utc_timestamp, 10),
    };
  }

  return {
    ...order,
    orderId: '',
    state: 'rejected',
    timestamp: parseInt(payload.utc_timestamp, 10),
  };
};
