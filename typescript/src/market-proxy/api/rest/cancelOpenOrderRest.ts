import MarketProxyWs from '../../base/MarketProxyWs';

export type CancelOpenOrderRestArgs = { orderId?: string; clientOrderId?: string };

export type CancelOrderRestResponseRaw = {
  tradeable_entity_id: string;
  symbol: string;
  order_id: string;
  client_order_id: string;
  timestamp: string;
  reason: string;
};

export const cancelOpenOrderRest = async (
  ws: MarketProxyWs,
  { clientOrderId, orderId }: CancelOpenOrderRestArgs
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
    method: 'DELETE',
  })) as { cancel_order_response: CancelOrderRestResponseRaw };

  return response.cancel_order_response;
};
