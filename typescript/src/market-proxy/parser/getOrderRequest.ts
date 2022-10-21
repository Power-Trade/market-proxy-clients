import { OrderRequest } from '../types';
import { log } from '../utils/log';

export const getOrderRequest = ({
  orderType,
  side,
  marketType,
  timeInForce,
  quantity,
  activeCycles,
  minimumQuantity,
  price,
  clientOrderId,
  legs,
  symbol,
  tradeableEntityId,
}: OrderRequest) => {
  const payload: any = {
    market_id: marketType === 'firm' ? '0' : 'none',
    side,
    quantity: quantity.toString(),
    type: orderType.toUpperCase(),
    time_in_force: timeInForce,
    client_order_id: clientOrderId,
  };

  if (marketType !== 'rfq' && orderType !== 'Market') {
    payload.price = price.toString();
  }

  if (orderType !== 'Market') {
    payload.recv_window = activeCycles.toString();
  }

  if (orderType === 'Market' && timeInForce !== 'IOC') {
    throw new Error('Market order time in force must be IOC');
  }

  if (legs && minimumQuantity !== undefined) {
    payload.legs = legs.map((l) => ({
      ratio: l.ratio.toString(),
      sym: l.symbol,
      tid: l.tradeableEntityId,
    }));
  } else if (symbol && tradeableEntityId) {
    throw new Error(`Please specify symbol or tradeable entity id`);
  } else if (symbol) {
    payload.symbol = symbol;
    delete payload.tradeable_entity_id;
  } else if (tradeableEntityId) {
    payload.tradeable_entity_id = tradeableEntityId;
    delete payload.symbol;
  } else {
    log('order is missing symbol or tid or legs');
  }

  return payload;
};
