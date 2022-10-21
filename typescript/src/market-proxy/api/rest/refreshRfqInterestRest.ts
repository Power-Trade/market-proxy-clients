import MarketProxyWs from '../../base/MarketProxyWs';
import { RefreshRfqInterestRestRaw } from '../../types';

export type RefreshRfqInterestRestArgs = { orderId?: string; clientOrderId?: string };

export type CancelOrderRestResponseRaw = {
  tradeable_entity_id: string;
  symbol: string;
  order_id: string;
  client_order_id: string;
  timestamp: string;
  reason: string;
};

export const refreshRfqInterestRest = async (
  ws: MarketProxyWs,
  { clientOrderId, orderId }: RefreshRfqInterestRestArgs
) => {
  if (!orderId && !clientOrderId) {
    throw new Error('No orderId or clientOrderId specified');
  }

  const url =
    orderId !== undefined
      ? `${ws.httpUrl}/v1/api/refreshInterest?order_id=${orderId}`
      : `${ws.httpUrl}/v1/api/refreshInterest?client_order_id=${clientOrderId}`;

  const response = (await ws.restCall({
    url,
    method: 'POST',
  })) as { refresh_response: RefreshRfqInterestRestRaw };

  return response.refresh_response;
};
