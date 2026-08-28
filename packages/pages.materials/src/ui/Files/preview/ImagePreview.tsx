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
        'relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden',
        isFullscreen ? '' : 'bg-background-page rounded-xl p-4',
      )}
    >
      {!loaded ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <FilePreviewLoading isFullscreen={isFullscreen} className="min-h-0" />
        </div>
      ) : null}
      <PreviewZoomStage enabled={isFullscreen}>
        <img
          src={blobUrl}
          alt={fileName}
          className={cn(
            'rounded-xl object-contain',
            isFullscreen
              ? 'max-h-[calc(100dvh-160px)] max-w-[min(1280px,calc(100vw-80px))]'
              : 'max-h-full max-w-full',
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
