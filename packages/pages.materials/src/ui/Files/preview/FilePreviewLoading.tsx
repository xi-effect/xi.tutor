import { useTranslation } from 'react-i18next';
import { cn } from '@xipkg/utils';

type FilePreviewLoadingProps = {
  isFullscreen?: boolean;
  className?: string;
};

export const FilePreviewLoading = ({ isFullscreen, className }: FilePreviewLoadingProps) => {
  const { t } = useTranslation('materials');

  return (
    <div
      className={cn(
        'flex min-h-[320px] w-full flex-col items-center justify-center gap-3',
        className,
      )}
    >
      <div
        className={cn(
          'size-8 animate-spin rounded-full border-2',
          isFullscreen
            ? 'border-white/20 border-t-white'
            : 'border-border-default border-t-icon-brand',
        )}
      />
      <p className={cn('text-s-base', isFullscreen ? 'text-white/70' : 'text-text-secondary')}>
        {t('files.preview.loading')}
      </p>
    </div>
  );
};
