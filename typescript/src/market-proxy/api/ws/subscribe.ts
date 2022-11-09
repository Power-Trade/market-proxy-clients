import MarketProxyWs from '../../base/MarketProxyWs';
import { SubscribeTypeRaw } from '../../types';
import { getUserTag } from '../../utils/userTag';

export type SubscribeWsArgs = {
  symbol?: string;
  tradeableEntityId?: string;
  type: SubscribeTypeRaw;
  interval: number;
  onSnapshot: (snapshot: any) => void;
};

export const subscribe = async (ws: MarketProxyWs, args: SubscribeWsArgs) => {
  const unsubscribe = ws.addOnMessageListener(args.onSnapshot);
  await ws.sendTaggedRequest('subscribe', {
    market_id: '0',
    symbol: args.symbol,
    type: args.type,
    tradeable_entity_id: args.tradeableEntityId,
    interval: args.interval.toString(),
    user_tag: getUserTag(),
  });

  return unsubscribe;
};
