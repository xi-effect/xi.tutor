import { PaymentTypeT } from 'features.table';
import { RubbleCircle, Card } from '@xipkg/icons';

const iconsMap = {
  cash: <RubbleCircle />,
  transfer: <Card />,
};

export const renderIcon = (paymentType: PaymentTypeT) => iconsMap[paymentType] ?? null;
