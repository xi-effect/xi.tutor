import { Button } from '@xipkg/button';
import { File } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

type FilePreviewUnsupportedProps = {
  onDownload: () => void;
  isDownloading?: boolean;
  className?: string;
};

export const FilePreviewUnsupported = ({
  onDownload,
  isDownloading,
  className,
}: FilePreviewUnsupportedProps) => {
  const { t } = useTranslation('materials');

  return (
    <div
      className={cn(
        'flex min-h-[320px] w-full flex-col items-center justify-center gap-6 px-6 py-10 text-center',
        className,
      )}
    >
      <div className="bg-background-subtle flex size-20 items-center justify-center rounded-full">
        <File className="fill-icon-secondary size-8" />
      </div>
      <div className="flex max-w-md flex-col gap-1">
        <p className="text-text-primary text-xl font-medium">
          {t('files.preview.unsupportedTitle')}
        </p>
        <p className="text-s-base text-text-secondary">
          {t('files.preview.unsupportedDescription')}
        </p>
      </div>
      <Button
        type="button"
        variant="primary"
        size="m"
        className="h-auto rounded-xl px-5 py-2.5 font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
        onMouseDown={(event) => event.preventDefault()}
        onClick={onDownload}
        disabled={isDownloading}
      >
        {t('files.preview.downloadFile')}
      </Button>
    </div>
  );
};
