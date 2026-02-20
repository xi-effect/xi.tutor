import { PaymentTypeT } from 'common.types';
import { RubbleCircle, Card } from '@xipkg/icons';

const iconsMap = {
  cash: <RubbleCircle />,
  transfer: <Card />,
};

export const renderIcon = (paymentType: PaymentTypeT) => iconsMap[paymentType] ?? null;
