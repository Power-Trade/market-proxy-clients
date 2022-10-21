import MarketProxyWs from '../../base/MarketProxyWs';
import { getUserTag } from '../../utils/userTag';

export type CancelOpenOrderWsArgs = { orderId?: string; clientOrderId?: string };

export const cancelOpenOrderWs = async (
  ws: MarketProxyWs,
  { clientOrderId, orderId }: CancelOpenOrderWsArgs
) => {
  if (!orderId && !clientOrderId) {
    throw new Error('No orderId or clientOrderId specified');
  }

  if (orderId !== undefined) {
    const [, response] = await ws.sendOrderIdRequest('cancel_order', {
      order_id: orderId,
      user_tag: getUserTag(),
    });

    return response;
  } else {
    const [, response] = await ws.sendClientOrderIdRequest('cancel_order', {
      client_order_id: clientOrderId,
      user_tag: getUserTag(),
    });

    return response;
  }
};
