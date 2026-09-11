import { Button } from '@xipkg/button';
import { PageEmptyState, pageEmptyActionButtonClass } from 'common.ui';
import { useTranslation } from 'react-i18next';

type MathBankEmptyProps = {
  onReset: () => void;
  className?: string;
};

export const MathBankEmpty = ({ onReset, className }: MathBankEmptyProps) => {
  const { t } = useTranslation('mathBank');

  return (
    <div
      className={
        className ??
        'flex min-h-[calc(100dvh-280px)] w-full flex-col items-center justify-center gap-6 px-6 py-16'
      }
    >
      <div className="flex max-w-md flex-col gap-2 text-center">
        <p className="text-l-base text-text-primary font-semibold">{t('empty.title')}</p>
        <p className="text-s-base text-text-secondary">{t('empty.description')}</p>
      </div>
      <Button
        type="button"
        variant="none"
        className={pageEmptyActionButtonClass}
        onClick={onReset}
        data-umami-event="math-bank-reset-all-empty"
      >
        {t('filters.resetAll')}
      </Button>
    </div>
  );
};

export const MathBankErrorState = () => {
  const { t } = useTranslation('mathBank');

  return (
    <PageEmptyState
      title={t('empty.errorTitle')}
      description={t('empty.errorDescription')}
      illustration={<div className="bg-background-subtle h-full w-full rounded-2xl" />}
    />
  );
};
