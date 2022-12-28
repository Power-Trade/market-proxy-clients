import MarketProxyWs from '../../base/MarketProxyWs';
import { getOrderRequest } from '../../parser/getOrderRequest';
import { OrderRequest } from '../../types';
import { getUserTag } from '../../utils/userTag';

export const placeOrderRest = async (ws: MarketProxyWs, order: OrderRequest) => {
  console.log(JSON.stringify({ new_order: { ...getOrderRequest(order), user_tag: getUserTag() } }));
  const response = (await ws.restCall({
    url: `${ws.httpUrl}/v1/api/order`,
    method: 'POST',
    data: { new_order: { ...getOrderRequest(order), user_tag: getUserTag() } },
  })) as any;

  if (response.order_accepted) {
    return {
      ...order,
      orderId: response.order_accepted.order_id as string,
      state: 'accepted',
      timestamp: parseInt(response.order_accepted.utc_timestamp, 10),
    };
  }

  return {
    ...order,
    orderId: '',
    state: 'rejected',
    timestamp: response?.order_rejected?.utc_timestamp
      ? parseInt(response.order_rejected.utc_timestamp, 10)
      : 0,
  };
};
