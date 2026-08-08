import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  const { t } = useTranslation('classroom');

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-text-primary text-xl font-medium">{t('errors.loadData')}</h2>
      <div className="flex items-center gap-2">
        <p className="text-text-primary">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} className="text-m-base w-48" variant="none" size="m">
            {t('actions.retry')}
          </Button>
        )}
      </div>
    </div>
  );
};
