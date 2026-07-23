import { PaymentTypeT } from 'common.types';
import { RubbleCircle, Card } from '@xipkg/icons';

const iconsMap = {
  cash: <RubbleCircle className="fill-icon-secondary pt-1" />,
  transfer: <Card className="fill-icon-secondary pt-1" />,
};

export const renderIcon = (paymentType: PaymentTypeT) => iconsMap[paymentType] ?? null;
