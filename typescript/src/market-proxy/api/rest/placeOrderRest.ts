import MarketProxyWs from '../../base/MarketProxyWs';
import { getOrderRequest } from '../../parser/getOrderRequest';
import { OrderRequest } from '../../types';

export const placeOrderRest = async (ws: MarketProxyWs, order: OrderRequest) => {
  const response = (await ws.restCall({
    url: `${ws.httpUrl}/v1/api/order?${new URLSearchParams(getOrderRequest(order))}`,
    method: 'POST',
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
