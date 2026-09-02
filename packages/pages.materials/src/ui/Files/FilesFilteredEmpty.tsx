import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';

type FilesFilteredEmptyProps = {
  onReset: () => void;
};

export const FilesFilteredEmpty = ({ onReset }: FilesFilteredEmptyProps) => {
  const { t } = useTranslation('materials');

  return (
    <div className="flex min-h-[calc(100dvh-280px)] w-full flex-col items-center justify-center gap-6 px-6 py-16">
      <div className="flex max-w-md flex-col gap-2 text-center">
        <p className="text-l-base text-text-primary font-semibold">
          {t('files.filteredEmptyTitle')}
        </p>
        <p className="text-s-base text-text-secondary">{t('files.filteredEmptyDescription')}</p>
      </div>
      <Button
        type="button"
        variant="secondary"
        className="text-brand-80 h-auto rounded-xl px-5 py-3 text-base font-medium"
        onClick={onReset}
        data-umami-event="materials-files-reset-all-empty"
      >
        {t('files.resetAll')}
      </Button>
    </div>
  );
};
