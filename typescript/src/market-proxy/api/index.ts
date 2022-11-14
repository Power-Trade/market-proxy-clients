import MarketProxyWs from '../base/MarketProxyWs';
import {
  Config,
  ExecutionRaw,
  OrderRequest,
  RfqAddedRaw,
  RfqRemovedRaw,
  SnapshotRaw,
} from '../types';
import { generateAccessToken } from '../utils/cryptography';
import { apiTimeRest } from './rest/apiTimeRest';
import { authenticate } from './ws/authenticate';
import { cancelAllOpenOrdersRest } from './rest/cancelAllOpenOrdersRest';
import { cancelAllOpenOrdersWs, CancelAllOpenOrdersWsArgs } from './ws/cancelAllOpenOrdersWs';
import { cancelOpenOrderWs, CancelOpenOrderWsArgs } from './ws/cancelOpenOrderWs';
import { fetchEntitiesAndRulesWs } from './ws/fetchEntitiesAndRulesWs';
import { fetchOpenOrdersRest } from './rest/fetchOpenOrdersRest';
import { placeBulkOrderWs } from './ws/placeBulkOrderWs';
import { placeOrderWs } from './ws/placeOrderWs';
import { exchangeInfoRest } from './rest/exchangeInfoRest';
import { deliverableInfoRest } from './rest/deliverableInfoRest';
import { balanceRest } from './rest/balanceRest';
import { positionsRest } from './rest/positionsRest';
import { cancelOpenOrderRest, CancelOpenOrderRestArgs } from './rest/cancelOpenOrderRest';
import { getOrderDetailsRest, GetOrderDetailsRestArgs } from './rest/getOrderDetailsRest';
import { refreshRfqInterestRest, RefreshRfqInterestRestArgs } from './rest/refreshRfqInterestRest';
import { orderbookRest, OrderbookRestArgs } from './rest/orderbookRest';
import { placeOrderRest } from './rest/placeOrderRest';
import { refreshRfqInterestWs } from './ws/refreshRfqInterestWs';
import { subscribe, SubscribeWsArgs } from './ws/subscribeWs';
import { startListeningForRfqsWs } from './ws/startListeningForRfqsWs';
import { stopListeningForRfqsWs } from './ws/stopListeningForRfqsWs';
import { positionsWs } from './ws/positionsWs';

export class MarketProxyApi {
  public ws: MarketProxyWs;

  constructor(config: Config, onOpen: (api: MarketProxyApi) => void) {
    const accessToken = generateAccessToken(config.apiKey, config.privateKey);

    this.ws = new MarketProxyWs({
      wsUrl: config.wsUrl,
      httpUrl: config.httpUrl,
      accessToken,
      onOpen: () => onOpen(this),
    });
  }

  public close = () => this.ws.close();

  // WebSocket
  public authenticate = () => authenticate(this.ws);

  public fetchEntitiesAndRulesWs = () => fetchEntitiesAndRulesWs(this.ws);

  public placeOrderWs = (order: OrderRequest) => placeOrderWs(this.ws, order);

  public placeBulkOrderWs = (orders: OrderRequest[]) => placeBulkOrderWs(this.ws, orders);

  public cancelOpenOrderWs = (args: CancelOpenOrderWsArgs) => cancelOpenOrderWs(this.ws, args);

  public cancelAllOpenOrdersWs = (args?: CancelAllOpenOrdersWsArgs) =>
    cancelAllOpenOrdersWs(this.ws, args);

  public refreshRfqInterestWs = (args: RefreshRfqInterestRestArgs) =>
    refreshRfqInterestWs(this.ws, args);

  public subscribeWs = (args: SubscribeWsArgs) => subscribe(this.ws, args);

  public startListeningForRfqsWs = () => startListeningForRfqsWs(this.ws);

  public stopListeningForRfqsWs = () => stopListeningForRfqsWs(this.ws);

  public positionsWs = () => positionsWs(this.ws);

  // REST
  public apiTimeRest = () => apiTimeRest(this.ws);

  public fetchOpenOrdersRest = () => fetchOpenOrdersRest(this.ws);

  public cancelAllOpenOrdersRest = () => cancelAllOpenOrdersRest(this.ws);

  public exchangeInfoRest = () => exchangeInfoRest(this.ws);

  public deliverableInfoRest = () => deliverableInfoRest(this.ws);

  public balanceRest = () => balanceRest(this.ws);

  public positionsRest = () => positionsRest(this.ws);

  public cancelOpenOrderRest = (args: CancelOpenOrderRestArgs) =>
    cancelOpenOrderRest(this.ws, args);

  public getOrderDetailsRest = (args: GetOrderDetailsRestArgs) =>
    getOrderDetailsRest(this.ws, args);

  public refreshRfqInterestRest = (args: RefreshRfqInterestRestArgs) =>
    refreshRfqInterestRest(this.ws, args);

  public orderbookRest = (args: OrderbookRestArgs) => orderbookRest(this.ws, args);

  public placeOrderRest = (order: OrderRequest) => placeOrderRest(this.ws, order);

  // Listeners
  public onRfqAdded = (callback: (payload: RfqAddedRaw) => void) => {
    return this.ws.addOnMessageListener({
      callback,
      selector: (event, payload) => {
        return event === 'order_added' && payload?.market_id === 'none';
      },
    });
  };

  public onRfqRemoved = (callback: (payload: RfqRemovedRaw) => void) => {
    return this.ws.addOnMessageListener({
      callback,
      selector: (event, payload) => {
        return event === 'order_deleted' && payload?.market_id === 'none';
      },
    });
  };

  public onSnapshot = (callback: (payload: SnapshotRaw) => void) => {
    return this.ws.addOnMessageListener({
      callback,
      selector: (event) => event === 'snapshot',
    });
  };

  public onExecution = (callback: (payload: ExecutionRaw) => void) => {
    return this.ws.addOnMessageListener({
      callback,
      selector: (event) => event === 'execution',
    });
  };
}

const getMarketProxyApi = (config: Config) => {
  return new Promise<MarketProxyApi>((resolve) => new MarketProxyApi(config, resolve));
};

export default getMarketProxyApi;
