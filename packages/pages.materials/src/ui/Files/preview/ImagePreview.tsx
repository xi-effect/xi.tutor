import { useEffect, useState } from 'react';
import { cn } from '@xipkg/utils';
import { FilePreviewLoading } from './FilePreviewLoading';
import { PreviewZoomStage } from './PreviewZoomStage';

type ImagePreviewProps = {
  blobUrl: string;
  fileName: string;
  isFullscreen: boolean;
  onDimensions: (width: number, height: number) => void;
  onError: () => void;
};

export const ImagePreview = ({
  blobUrl,
  fileName,
  isFullscreen,
  onDimensions,
  onError,
}: ImagePreviewProps) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [blobUrl]);

  return (
    <div
      className={cn(
        'bg-background-page relative min-h-0 w-full flex-1 overflow-hidden',
        !isFullscreen && 'rounded-xl',
      )}
    >
      {!loaded ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <FilePreviewLoading isFullscreen={isFullscreen} className="min-h-0" />
        </div>
      ) : null}
      <PreviewZoomStage
        enabled={isFullscreen}
        className={cn('absolute inset-0', !isFullscreen && 'p-4')}
      >
        <img
          src={blobUrl}
          alt={fileName}
          className={cn(
            'h-auto max-h-full w-auto max-w-full rounded-xl object-contain',
            isFullscreen && 'max-h-[calc(100dvh-160px)] max-w-[min(1280px,calc(100vw-80px))]',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
          onLoad={(event) => {
            setLoaded(true);
            onDimensions(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight);
          }}
          onError={onError}
          draggable={false}
        />
      </PreviewZoomStage>
    </div>
  );
};
