const MONEY_PRECISION = 100;

export const roundMoney = (value: number) => {
  return Math.round((value + Number.EPSILON) * MONEY_PRECISION) / MONEY_PRECISION;
};
