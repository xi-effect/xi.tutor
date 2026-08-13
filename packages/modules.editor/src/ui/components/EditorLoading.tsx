import { useTranslation } from 'react-i18next';

export const EditorLoading = () => {
  const { t } = useTranslation('editor');

  return (
    <div
      className="flex min-h-[12rem] w-full items-center justify-center py-8"
      role="status"
      aria-live="polite"
    >
      <div
        className="text-text-link inline-block size-6 animate-spin rounded-full border-[3px] border-current border-t-transparent"
        aria-hidden
      />
      <span className="sr-only">{t('status.initializing')}</span>
    </div>
  );
};

export const EditorSyncError = () => {
  const { t } = useTranslation('editor');

  return (
    <div className="text-text-danger flex min-h-[12rem] w-full items-center justify-center py-8 text-center text-sm">
      {t('status.accessError')}
    </div>
  );
};
