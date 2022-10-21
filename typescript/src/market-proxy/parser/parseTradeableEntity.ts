import { EntitySymbolRaw, OptionType, ProductTypeWithIndex, TradeableEntity } from '../types';
import { toNumber } from '../utils/number';

export const getExpiryDateFromString = (dateText: string) => {
  const expiryYear = parseInt(dateText.substring(0, 4), 10);
  const expiryMonth = parseInt(dateText.substring(4, 6), 10);
  const expiryDay = parseInt(dateText.substring(6), 10);

  return new Date(Date.UTC(expiryYear, expiryMonth - 1, expiryDay, 8, 0, 0, 0));
};

export const parseTradeableEntity = (
  tradeableEntityRaw: EntitySymbolRaw
): TradeableEntity | undefined => {
  const {
    symbol,
    tradeable_entity_id,
    tags,
    base_asset,
    maximum_quantity,
    maximum_value,
    minimum_quantity,
    minimum_value,
    price_step,
    quantity_step,
    quote_asset,
    status,
  } = tradeableEntityRaw;

  const products: ProductTypeWithIndex[] = ['perpetual', 'future', 'option', 'spot', 'index'];

  const parts = symbol.split('-');
  const productType = products.find((p) => tags.indexOf(p) > -1);

  if (productType === undefined) {
    return;
  }

  const result: TradeableEntity = {
    underlying: parts[0],
    symbol,
    id: tradeable_entity_id,
    productType,
    baseAsset: base_asset,
    maximumQuantity: toNumber(maximum_quantity),
    maximumValue: toNumber(maximum_value),
    minimumQuantity: toNumber(minimum_quantity),
    minimumValue: toNumber(minimum_value),
    priceStep: toNumber(price_step),
    quantityStep: toNumber(quantity_step),
    quoteAsset: quote_asset,
    status,
  };

  if (productType === 'option' && parts.length === 3) {
    const expiry = getExpiryDateFromString(parts[1]);
    const optionType: OptionType = parts[2].endsWith('C') ? 'call' : 'put';

    return {
      ...result,
      optionType,
      expiryTimeStamp: expiry.getTime(),
      strike: parseInt(parts[2].replace('C', '').replace('P', ''), 10),
    };
  } else if (productType === 'perpetual' && parts.length === 3) {
    return result;
  } else if (productType === 'future' && parts.length === 2) {
    const expiry = getExpiryDateFromString(parts[1]);

    return {
      ...result,
      expiryTimeStamp: expiry.getTime(),
    };
  } else if (productType === 'spot' && parts.length === 2) {
    return result;
  }

  return result;
};
