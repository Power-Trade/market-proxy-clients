import MarketProxyWs from '../../base/MarketProxyWs';
import { parseTradeableEntity } from '../../parser/parseTradeableEntity';
import { EntitiesAndRulesResponseRaw, TradeableEntity } from '../../types';

export const fetchEntitiesAndRulesWs = async (ws: MarketProxyWs) => {
  const [, response] = await ws.sendTaggedRequest('entities_and_rules_request');

  return (response as EntitiesAndRulesResponseRaw).symbols
    .map(parseTradeableEntity)
    .filter((t) => t !== undefined) as TradeableEntity[];
};
