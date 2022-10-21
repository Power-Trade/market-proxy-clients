import MarketProxyWs from '../../base/MarketProxyWs';
import { OrderDetailsRestRaw } from '../../types';

export type GetOrderDetailsRestArgs = { orderId?: string; clientOrderId?: string };

export type CancelOrderRestResponseRaw = {
  tradeable_entity_id: string;
  symbol: string;
  order_id: string;
  client_order_id: string;
  timestamp: string;
  reason: string;
};

export const getOrderDetailsRest = async (
  ws: MarketProxyWs,
  { clientOrderId, orderId }: GetOrderDetailsRestArgs
) => {
  if (!orderId && !clientOrderId) {
    throw new Error('No orderId or clientOrderId specified');
  }

  const url =
    orderId !== undefined
      ? `${ws.httpUrl}/v1/api/order?order_id=${orderId}`
      : `${ws.httpUrl}/v1/api/order?client_order_id=${clientOrderId}`;

  const response = (await ws.restCall({
    url,
    method: 'GET',
  })) as { query_order_response: OrderDetailsRestRaw };

  return response.query_order_response;
};
