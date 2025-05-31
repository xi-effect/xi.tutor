type AmountProps = {
  amount: number;
};

export const AmountPaymentCell = ({ amount }: AmountProps) => {
  return <span>{amount}₽</span>;
};
