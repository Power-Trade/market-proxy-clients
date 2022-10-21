import MarketProxyWs from '../base/MarketProxyWs';
import { Config, OrderRequest } from '../types';
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

  public close = async () => await this.ws.close();

  // WebSocket
  public authenticate = async () => await authenticate(this.ws);

  public fetchEntitiesAndRulesWs = async () => await fetchEntitiesAndRulesWs(this.ws);

  public placeOrderWs = async (order: OrderRequest) => await placeOrderWs(this.ws, order);

  public placeBulkOrderWs = (orders: OrderRequest[]) => placeBulkOrderWs(this.ws, orders);

  public cancelOpenOrderWs = (args: CancelOpenOrderWsArgs) => cancelOpenOrderWs(this.ws, args);

  public cancelAllOpenOrdersWs = (args?: CancelAllOpenOrdersWsArgs) =>
    cancelAllOpenOrdersWs(this.ws, args);

  public refreshRfqInterestWs = (args: RefreshRfqInterestRestArgs) =>
    refreshRfqInterestWs(this.ws, args);

  // REST
  public apiTimeRest = async () => await apiTimeRest(this.ws);

  public fetchOpenOrdersRest = async () => await fetchOpenOrdersRest(this.ws);

  public cancelAllOpenOrdersRest = async () => await cancelAllOpenOrdersRest(this.ws);

  public exchangeInfoRest = async () => await exchangeInfoRest(this.ws);

  public deliverableInfoRest = async () => await deliverableInfoRest(this.ws);

  public balanceRest = async () => await balanceRest(this.ws);

  public positionsRest = async () => await positionsRest(this.ws);

  public cancelOpenOrderRest = async (args: CancelOpenOrderRestArgs) =>
    await cancelOpenOrderRest(this.ws, args);

  public getOrderDetailsRest = async (args: GetOrderDetailsRestArgs) =>
    await getOrderDetailsRest(this.ws, args);

  public refreshRfqInterestRest = async (args: RefreshRfqInterestRestArgs) =>
    await refreshRfqInterestRest(this.ws, args);

  public orderbookRest = async (args: OrderbookRestArgs) => await orderbookRest(this.ws, args);

  public placeOrderRest = async (order: OrderRequest) => await placeOrderRest(this.ws, order);
}

const getMarketProxyApi = (config: Config) => {
  return new Promise<MarketProxyApi>((resolve) => new MarketProxyApi(config, resolve));
};

export default getMarketProxyApi;
