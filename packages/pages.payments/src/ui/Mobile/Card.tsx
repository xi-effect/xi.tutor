import { Button } from '@xipkg/button';

import { Edit, Trash } from '@xipkg/icons';

import { formatDate } from '../../utils';
import { mapPaymentStatus, PaymentStatusT, statusColorMap } from 'features.table';
import { UserProfile } from '@xipkg/userprofile';
import { cn } from '@xipkg/utils';

type CardPropsT = {
  amountPayment: number;
  id: number;
  datePayment: string;
  statusPayment: PaymentStatusT;
};

export const Card = ({ amountPayment, datePayment, statusPayment }: CardPropsT) => {
  const statusText = mapPaymentStatus[statusPayment];

  return (
    <div className="border-gray-30 bg-gray-0 relative flex min-h-[112px] cursor-pointer flex-col justify-between gap-2 rounded-2xl border p-4">
      <div className="flex flex-row items-baseline gap-1">{formatDate(datePayment)}</div>
      <UserProfile
        text="Иван Иванов"
        label="Индивидуальное"
        size="m"
        userId={1}
        className="flex-1"
      />
      <div className="mt-2 flex flex-row items-baseline gap-1">
        <span className="text-brand-100 text-m-base font-normal">{amountPayment} </span>
        <span className="text-brand-40 text-xs-base font-normal">₽</span>
        <div className={cn('text-m-base ml-4 font-normal', statusColorMap[statusPayment])}>
          {statusText}
        </div>
      </div>
      {statusPayment === 'processing' && (
        <Button
          variant="ghost"
          size="s"
          className="text-brand-100 bg-brand-0 hover:bg-brand-20/40 mt-2 rounded-lg"
        >
          Подтвердить
        </Button>
      )}
      <div className="absolute top-4 right-4 flex flex-col items-center justify-between gap-2">
        <Button className="size-8 rounded-lg p-0" variant="ghost" size="s">
          <Trash className="fill-gray-60 size-4" />
        </Button>
        <Button className="size-8 rounded-lg p-0" variant="ghost" size="s">
          <Edit className="fill-gray-60 size-4" />
        </Button>
      </div>
    </div>
  );
};
