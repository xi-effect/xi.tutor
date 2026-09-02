import { useTranslation } from 'react-i18next';
import { cn } from '@xipkg/utils';

type FilePreviewLoadingProps = {
  isFullscreen?: boolean;
  className?: string;
};

export const FilePreviewLoading = ({ className }: FilePreviewLoadingProps) => {
  const { t } = useTranslation('materials');

  return (
    <div
      className={cn(
        'flex min-h-[320px] w-full flex-col items-center justify-center gap-3',
        className,
      )}
    >
      <div className="border-border-default border-t-icon-brand size-8 animate-spin rounded-full border-2" />
      <p className="text-s-base text-text-secondary">{t('files.preview.loading')}</p>
    </div>
  );
};
