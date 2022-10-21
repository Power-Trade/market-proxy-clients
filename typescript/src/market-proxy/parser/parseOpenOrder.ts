import { MarketProxyOpenOrderRaw, OpenOrder } from '../types';
import { toNumber } from '../utils/number';

export const parseOpenOrder = (o: MarketProxyOpenOrderRaw): OpenOrder => ({
  cancelState: o.cancel_state,
  clientOrderId: o.client_order_id,
  executions: o.executions.map((e) => ({
    executedPrice: toNumber(e.executed_price),
    executedQuantity: toNumber(e.executed_quantity),
    liquidityFlag: e.liquidity_flag,
    tradeId: e.trade_id,
    utcTimestamp: toNumber(e.utc_timestamp) / 1000000,
  })),
  orderId: o.order_id,
  orderState: o.order_state,
  price: toNumber(o.price),
  quantity: toNumber(o.quantity),
  side: o.side,
  symbol: o.symbol,
  tradeableEntityId: o.tradeable_entity_id,
  marketType: o.market_id === '255' || o.market_id === 'none' ? 'rfq' : 'firm',
  legs: o.legs?.map((l) => ({
    ratio: toNumber(l.ratio),
    symbol: l.symbol,
    tradeableEntityId: l.tradeable_entity_id,
  })),
  isMultiLeg: (o.legs ?? []).length > 1,
  isMarketProxyOrder: true,
});
