import MarketProxyWs from '../../base/MarketProxyWs';

export const startListeningForRfqsWs = async (ws: MarketProxyWs) => {
  await ws.sendTaggedRequest('register_for_rfqs');
};
