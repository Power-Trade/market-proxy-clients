export type Environment = 'dev' | 'prod' | 'staging' | 'test';

export type Config = {
  apiKey: string;
  privateKey: string;
  wsUrl: string;
  httpUrl: string;
};

export type Side = 'buy' | 'sell';

export type RfqTimeInForce = 'GTC' | 'GTD' | 'IOC' | 'DAY';

export type MarketType = 'firm' | 'rfq';

export type ProductType = 'option' | 'perpetual' | 'future' | 'spot';

export type ProductTypeWithIndex = ProductType | 'index';

export type OptionType = 'call' | 'put';

export type RequestName =
  | 'authenticate'
  | 'new_order'
  | 'order_accepted'
  | 'new_bulk_order'
  | 'cancel_all_orders'
  | 'command_response'
  | 'entities_and_rules_request'
  | 'refresh_interest'
  | 'cancel_order'
  | 'register_for_rfqs'
  | 'deregister_for_rfqs'
  | 'balances'
  | 'positions'
  | 'trade_history_request'
  | 'subscribe';

interface OrderLeg {
  symbol?: string;
  tradeableEntityId?: string;
  ratio: number;
}

export type OrderState = 'new' | 'accepted' | 'rejected';

export type Order = {
  symbol?: string;
  tradeableEntityId?: string;
  marketType: MarketType;
  orderType: 'Limit' | 'Market';
  side: Side;
  timeInForce: RfqTimeInForce;
  quantity: number;
  price: number;
  activeCycles: number;
  state: OrderState;
  legs?: OrderLeg[];
  minimumQuantity?: number;
  expireTimestamp?: number;
  clientOrderId: string;
};

export type OrderRequest = Order;

export type OrderResponse = Order & {
  timestamp: number;
};

export type OpenOrderExecutionRaw = {
  utc_timestamp: string;
  executed_price: string;
  executed_quantity: string;
  trade_id: string;
  liquidity_flag: string;
};

export type MarketProxyOpenOrderRaw = {
  tradeable_entity_id: string;
  symbol: string;
  order_id: string;
  client_order_id: string;
  quantity: string;
  price: string;
  side: Side;
  order_state: OrderState;
  cancel_state: string;
  market_id: string;
  legs?: {
    tradeable_entity_id: string;
    symbol: string;
    ratio: string;
  }[];
  executions: OpenOrderExecutionRaw[];
};

export type OpenOrderExecution = {
  utcTimestamp: number;
  executedPrice: number;
  executedQuantity: number;
  tradeId: string;
  liquidityFlag: string;
};

export type OpenOrder = {
  tradeableEntityId: string;
  symbol: string;
  orderId: string;
  clientOrderId: string;
  quantity: number;
  price: number;
  side: Side;
  orderState: OrderState;
  cancelState: string;
  marketType: MarketType;
  legs?: {
    tradeableEntityId: string;
    symbol: string;
    ratio: number;
  }[];
  executions: OpenOrderExecution[];
  isMultiLeg: boolean;
  isMarketProxyOrder: boolean;
};

export type OpenOrderResponseRaw = {
  query_open_orders_response: {
    utc_timestamp: string;
    open_orders: MarketProxyOpenOrderRaw[];
  };
};

export type EntitySymbolRaw = {
  symbol: string;
  tradeable_entity_id: string;
  status: string;
  base_asset: string;
  quote_asset: string;
  minimum_quantity: string;
  maximum_quantity: string;
  minimum_value: string;
  maximum_value: string;
  quantity_step: string;
  price_step: string;
  tags: string[];
};

export type TradeableEntity = {
  id: string;
  underlying: string;
  symbol: string;
  productType: ProductTypeWithIndex;
  expiryTimeStamp?: number;
  strike?: number;
  optionType?: OptionType;
  status: string;
  baseAsset: string;
  quoteAsset: string;
  minimumQuantity: number;
  maximumQuantity: number;
  minimumValue: number;
  maximumValue: number;
  quantityStep: number;
  priceStep: number;
};

export type EntitiesAndRulesResponseRaw = {
  server_utc_timestamp: string;
  user_tag: string;
  symbols: EntitySymbolRaw[];
};

export type CancelOrderResponseRaw = {
  server_utc_timestamp: string;
  utc_timestamp: string;
  tradeable_entity_id: string;
  symbol: string;
  order_id: string;
  client_order_id: string;
  filled_quantity: number;
  reason: string;
};

export type DeliverableInfoRaw = {
  symbol: string;
  deliverable_id: string;
};

export type PositionRaw = {
  symbol: string;
  deliverable_id: string;
  product_type: ProductType;
  timestamp: string;
  side: string;
  size: string;
  average_entry_price: string;
  mark_price: string;
  upnl: string;
};

export type PositionsWsResponseRaw = {
  server_utc_timestamp: string;
  user_tag: string;
  positions: PositionRaw[];
};

export type BalanceRaw = {
  deliverable_id: string;
  symbol: string;
  cash_balance: string;
  available_balance: string;
  reserved_balance: string;
  withdrawable_balance: string;
  timestamp: string;
};

export type BalancesWsResponseRaw = {
  server_utc_timestamp: string;
  user_tag: string;
  balances: BalanceRaw[];
};

export type OrderDetailsRestRaw = {
  utc_timestamp: string;
  market_id: string;
  tradeable_entity_id: string;
  symbol: string;
  type: string;
  order_id: string;
  client_order_id: string;
  quantity: string;
  price: string;
  side: string;
  order_state: string;
  cancel_state: string;
  executions: [];
};

export type OrderAcceptedWsRaw = {
  utc_timestamp: string;
  market_id: string;
  tradeable_entity_id: string;
  symbol: string;
  type: string;
  order_id: string;
  client_order_id: string;
  quantity: string;
  price: string;
};

export type RefreshRfqInterestRestRaw = {
  order_id: string;
  client_order_id: string;
  timestamp: string;
  reason: string;
};

export type RefreshRfqInterestWsRaw = {
  server_utc_timestamp: string;
  order_id: string;
  client_order_id: string;
  user_tag: string;
  reason: string;
};

export type OrderbookRestResponseRaw = {
  server_utc_timestamp: string;
  symbol: string;
  buy: {
    price: string;
    quantity: string;
  }[];
  sell: {
    price: string;
    quantity: string;
  }[];
};

export type SubscribeTypeRaw = 'snap_full_updates' | 'snap_only' | 'snap_with_deltas';

export type RfqAddedRaw = {
  server_utc_timestamp: string;
  utc_timestamp: string;
  market_id: 'none';
  tradeable_entity_id: string;
  symbol: string;
  side: Side;
  order_id: string;
  price: string;
  quantity: string;
};

export type RfqRemovedRaw = {
  server_utc_timestamp: string;
  utc_timestamp: string;
  market_id: 'none';
  tradeable_entity_id: string;
  symbol: string;
  side: Side;
  order_id: string;
};

export type SnapshotRawRow = {
  price: string;
  quantity: string;
  orderid: string;
  utc_timestamp: string;
};

export type SnapshotRaw = {
  server_utc_timestamp: string;
  market_id: string;
  tradeable_entity_id: string;
  symbol: string;
  buy: SnapshotRawRow[];
  sell: SnapshotRawRow[];
};

export type ExecutionRaw = {
  server_utc_timestamp: string;
  utc_timestamp: string;
  tradeable_entity_id: string;
  symbol: string;
  trade_id: string;
  order_id: string;
  client_order_id: string;
  executed_price: string;
  executed_quantity: string;
  liquidity_flag: string;
  price: string;
  side: Side;
  order_state: string;
};

export type BulkOrderWsResponseRaw = {
  user_tag: string;
  results: { client_order_id: string; order_state: string }[];
};

export type CancelOpenOrdersWsResponseRaw = {
  server_utc_timestamp: string;
  timestamp: string;
  reason: 'success';
  user_tag: string;
  results: { client_order_id: string; order_state: string }[];
};

export type CancelOpenOrdersRestResponseRaw = {
  cancel_all_orders_response: {
    timestamp: string;
    reason: string;
    results: { client_order_id: string; order_state: string }[];
  };
};
