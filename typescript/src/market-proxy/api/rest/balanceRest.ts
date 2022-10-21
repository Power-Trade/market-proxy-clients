import MarketProxyWs from '../../base/MarketProxyWs';
import { BalanceRaw } from '../../types';

export const balanceRest = async (ws: MarketProxyWs): Promise<BalanceRaw[]> => {
  const response = (await ws.restCall({
    url: `${ws.httpUrl}/v1/api/balances`,
    method: 'GET',
  })) as { balance_response: BalanceRaw[] };

  return response.balance_response;
};
