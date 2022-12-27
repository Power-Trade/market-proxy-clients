import MarketProxyWs from '../../base/MarketProxyWs';

export type TradeHistoryArgs =
  | {
      tradeCount: number;
      tradeTimestamp?: undefined;
    }
  | {
      tradeCount?: undefined;
      tradeTimestamp: number | string;
    };

export const tradeHistoryWs = async (ws: MarketProxyWs, args: TradeHistoryArgs) => {
  const payload = {
    // trade_count: args.tradeCount?.toString(),
    trade_time: args.tradeTimestamp?.toString(),
  } as any;

  const [, data] = await ws.sendTaggedRequest('trade_history_request', payload);

  return data as any;
};
