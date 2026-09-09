const MONEY_PRECISION = 100;

/** Шаг стрелок в поле стоимости: сотни рублей, а не копейки. */
export const PRICE_STEPPER_STEP = 100;

export const roundMoney = (value: number) => {
  return Math.round((value + Number.EPSILON) * MONEY_PRECISION) / MONEY_PRECISION;
};
