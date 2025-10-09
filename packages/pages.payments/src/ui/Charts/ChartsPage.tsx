import { Alert, AlertContainer, AlertTitle, AlertIcon, AlertDescription } from '@xipkg/alert';
import { InfoCircle } from '@xipkg/icons';
import { PaymentControl as PaymentsCharts } from 'features.charts';

export const ChartsPage = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-full pt-2 pr-4">
        <Alert className="w-full" variant="brand">
          <AlertIcon>
            <InfoCircle className="fill-brand-100" />
          </AlertIcon>
          <AlertContainer className="h-full">
            <AlertTitle>Начало работы с аналитикой</AlertTitle>
            <AlertDescription>
              На этой странице вы можете просматривать аналитику по оплате и доходам. Прежде чем
              данные начнут отображаться, должно пройти некоторое время.
            </AlertDescription>
          </AlertContainer>
        </Alert>
      </div>
      <PaymentsCharts />
    </div>
  );
};
