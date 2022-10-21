import MarketProxyWs from '../../base/MarketProxyWs';
import { parseOpenOrder } from '../../parser/parseOpenOrder';
import { OpenOrder, OpenOrderResponseRaw } from '../../types';

export const fetchOpenOrdersRest = async (ws: MarketProxyWs): Promise<OpenOrder[]> => {
  const response = await ws.restCall<OpenOrderResponseRaw>({
    method: 'GET',
    url: `${ws.httpUrl}/v1/api/openOrders`,
  });

  if (response.query_open_orders_response) {
    return response.query_open_orders_response.open_orders.map(parseOpenOrder);
  }

  throw new Error('Error fetching open orders');
};
