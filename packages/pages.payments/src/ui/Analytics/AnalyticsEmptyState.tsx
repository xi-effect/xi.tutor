import { Button } from '@xipkg/button';
import { ArrowUpRight } from '@xipkg/icons';
import { EmptyPaymentsFull } from 'common.ui';
import { useTranslation } from 'react-i18next';

const PAYMENTS_HELP_URL = 'https://support.sovlium.ru/payments';

export const AnalyticsEmptyState = () => {
  const { t } = useTranslation('payments');

  return (
    <div className="flex min-h-[420px] w-full flex-col items-center justify-center gap-8 px-6 py-10">
      <div className="flex max-w-md flex-col gap-2 text-center">
        <p className="text-l-base text-text-primary font-semibold">{t('analytics.empty.title')}</p>
        <p className="text-s-base text-text-secondary">{t('analytics.empty.description')}</p>
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="none"
            className="bg-background-page hover:bg-background-subtle text-xs-base h-8 rounded-lg px-4 font-medium text-text-primary"
            onClick={() => window.open(PAYMENTS_HELP_URL, '_blank', 'noopener,noreferrer')}
          >
            {t('empty.helpLink')}
            <ArrowUpRight className="fill-icon-primary ml-1 size-4 shrink-0" />
          </Button>
        </div>
      </div>
      <EmptyPaymentsFull className="h-auto max-h-[200px] w-auto max-w-[240px] object-contain" />
    </div>
  );
};
