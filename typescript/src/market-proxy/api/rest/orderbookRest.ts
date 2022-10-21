import MarketProxyWs from '../../base/MarketProxyWs';
import { OrderbookRestResponseRaw } from '../../types';

export type OrderbookRestArgs = { depth?: number; symbol?: string };

export type CancelOrderRestResponseRaw = {
  tradeable_entity_id: string;
  symbol: string;
  order_id: string;
  client_order_id: string;
  timestamp: string;
  reason: string;
};

export const orderbookRest = async (
  ws: MarketProxyWs,
  { depth = 5, symbol }: OrderbookRestArgs
) => {
  if (!symbol) {
    throw new Error('No depth or symbol specified');
  }

  const url = `${ws.httpUrl}/v1/api/orderbook?depth=${depth}&symbol=${symbol}`;

  const response = (await ws.restCall({
    url,
    method: 'GET',
  })) as { orderbook_response: OrderbookRestResponseRaw };

  return response.orderbook_response;
};
