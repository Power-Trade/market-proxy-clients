import MarketProxyWs from '../../base/MarketProxyWs';
import { getUserTag } from '../../utils/userTag';

export type CancelAllOpenOrdersWsArgs = { symbol?: string; tradeableEntityId?: string };

export const cancelAllOpenOrdersWs = async (
  ws: MarketProxyWs,
  { symbol, tradeableEntityId }: CancelAllOpenOrdersWsArgs = {}
) => {
  const payload: any = { user_tag: getUserTag() };

  if (symbol !== undefined) {
    payload.symbol = symbol;
  } else if (tradeableEntityId !== undefined) {
    payload.tradeable_entity_id = tradeableEntityId;
  }

  const [, response] = await ws.sendTaggedRequest('cancel_order', {
    symbol,
    user_tag: getUserTag(),
  });

  return response;
};
