import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';

type PaymentsFilteredEmptyProps = {
  onReset: () => void;
};

export const PaymentsFilteredEmpty = ({ onReset }: PaymentsFilteredEmptyProps) => {
  const { t } = useTranslation('payments');

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <div className="flex max-w-md flex-col gap-2 text-center">
        <p className="text-l-base text-text-primary font-semibold">
          {t('filters.filteredEmptyTitle')}
        </p>
        <p className="text-s-base text-text-secondary">{t('filters.filteredEmptyDescription')}</p>
      </div>
      <Button
        type="button"
        variant="secondary"
        className="text-brand-80 h-auto rounded-xl px-5 py-3 text-base font-medium"
        onClick={onReset}
        data-umami-event="payments-filters-reset-all-empty"
      >
        {t('filters.resetAll')}
      </Button>
    </div>
  );
};
