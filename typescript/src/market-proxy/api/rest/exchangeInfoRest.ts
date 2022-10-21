import MarketProxyWs from '../../base/MarketProxyWs';
import { parseTradeableEntity } from '../../parser/parseTradeableEntity';
import { EntitiesAndRulesResponseRaw, TradeableEntity } from '../../types';

export const exchangeInfoRest = async (ws: MarketProxyWs) => {
  const response = (await ws.restCall({
    url: `${ws.httpUrl}/v1/api/exchangeInfo`,
    method: 'GET',
  })) as { entities_and_rules_response: EntitiesAndRulesResponseRaw };

  return response.entities_and_rules_response.symbols
    .map(parseTradeableEntity)
    .filter((t) => t !== undefined) as TradeableEntity[];
};
