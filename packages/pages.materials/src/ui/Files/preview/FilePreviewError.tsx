import { Button } from '@xipkg/button';
import { Close } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

type FilePreviewErrorProps = {
  onRetry?: () => void;
  onDownload: () => void;
  isDownloading?: boolean;
  className?: string;
};

export const FilePreviewError = ({
  onRetry,
  onDownload,
  isDownloading,
  className,
}: FilePreviewErrorProps) => {
  const { t } = useTranslation('materials');

  return (
    <div
      className={cn(
        'flex min-h-[320px] w-full flex-col items-center justify-center gap-6 px-6 py-10 text-center',
        className,
      )}
    >
      <div className="bg-status-error-accent flex size-16 items-center justify-center rounded-full">
        <Close className="size-7 fill-white" />
      </div>
      <div className="flex max-w-md flex-col gap-1">
        <p className="text-text-primary text-xl font-medium">{t('files.preview.errorTitle')}</p>
        <p className="text-s-base text-text-secondary">{t('files.preview.errorDescription')}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry ? (
          <Button
            type="button"
            variant="primary"
            size="m"
            className="h-auto rounded-xl px-5 py-2.5 font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onRetry}
          >
            {t('files.preview.retry')}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="m"
          className="border-border-default h-auto rounded-xl border px-5 py-2.5 font-medium"
          onClick={onDownload}
          disabled={isDownloading}
        >
          {t('files.preview.downloadFile')}
        </Button>
      </div>
    </div>
  );
};
