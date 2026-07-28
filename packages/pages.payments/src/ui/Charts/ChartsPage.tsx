import { Alert, AlertContainer, AlertTitle, AlertIcon, AlertDescription } from '@xipkg/alert';
import { InfoCircle } from '@xipkg/icons';
import { PaymentControl as PaymentsCharts } from 'features.charts';
import { useTranslation } from 'react-i18next';

export const ChartsPage = () => {
  const { t } = useTranslation('payments');

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full pt-2 pr-4">
        <Alert className="w-full" variant="brand">
          <AlertIcon>
            <InfoCircle className="fill-icon-brand" />
          </AlertIcon>
          <AlertContainer className="h-full">
            <AlertTitle>{t('charts.title')}</AlertTitle>
            <AlertDescription>{t('charts.description')}</AlertDescription>
          </AlertContainer>
        </Alert>
      </div>
      <PaymentsCharts />
    </div>
  );
};
