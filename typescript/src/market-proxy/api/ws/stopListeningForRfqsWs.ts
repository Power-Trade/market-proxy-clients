import MarketProxyWs from '../../base/MarketProxyWs';

export const stopListeningForRfqsWs = async (ws: MarketProxyWs) => {
  await ws.sendTaggedRequest('deregister_for_rfqs');
};
