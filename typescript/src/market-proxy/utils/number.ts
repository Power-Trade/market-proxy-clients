import BigNumber from 'bignumber.js';

export const toNumber = (raw: string | number) => {
  return new BigNumber(raw).toNumber();
};
