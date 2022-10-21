import MarketProxyWs from '../../base/MarketProxyWs';
import { RefreshRfqInterestWsRaw } from '../../types';
import { getUserTag } from '../../utils/userTag';

export type RefreshRfqInterestWsArgs = { orderId?: string; clientOrderId?: string };

export const refreshRfqInterestWs = async (
  ws: MarketProxyWs,
  { clientOrderId, orderId }: RefreshRfqInterestWsArgs
) => {
  if (!orderId && !clientOrderId) {
    throw new Error('No orderId or clientOrderId specified');
  }

  if (orderId !== undefined) {
    const [, response] = await ws.sendOrderIdRequest('refresh_interest', {
      order_id: orderId,
      user_tag: getUserTag(),
    });

    return response as RefreshRfqInterestWsRaw;
  } else {
    const [, response] = await ws.sendClientOrderIdRequest('refresh_interest', {
      client_order_id: clientOrderId,
      user_tag: getUserTag(),
    });

    return response as RefreshRfqInterestWsRaw;
  }
};
