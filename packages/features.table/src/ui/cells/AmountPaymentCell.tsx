type AmountProps = {
  amount: number;
};

export const AmountPaymentCell = ({ amount }: AmountProps) => {
  return (
    <>
      <span className="text-brand-100 text-m-base font-normal">{amount} </span>
      <span className="text-brand-40 text-xs-base font-normal">₽</span>
    </>
  );
};
