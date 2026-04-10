import {
  ImageShapeUtil as TldrawImageShapeUtil,
  TLImageShape,
  HTMLContainer,
  useEditor,
  useImageOrVideoAsset,
  getUncroppedSize,
  usePrefersReducedMotion,
  useValue,
  TLAssetId,
  Editor,
} from 'tldraw';
import { memo, useCallback, useEffect, useState } from 'react';

export class CustomImageShapeUtil extends TldrawImageShapeUtil {
  override component(shape: TLImageShape) {
    return <CustomImageShape shape={shape} />;
  }
}

function getCroppedContainerStyle(shape: TLImageShape) {
  const crop = shape.props.crop;
  const topLeft = crop?.topLeft;
  if (!topLeft) {
    return { width: shape.props.w, height: shape.props.h };
  }
  const { w, h } = getUncroppedSize(shape.props, crop);
  return {
    transform: `translate(${-topLeft.x * w}px, ${-topLeft.y * h}px)`,
    width: w,
    height: h,
  };
}

function getFlipStyle(shape: TLImageShape) {
  const { flipX, flipY } = shape.props;
  if (!flipX && !flipY) return undefined;
  return {
    transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
    transformOrigin: 'center center',
  };
}

function getIsAnimated(editor: Editor, assetId: TLAssetId) {
  const asset = editor.getAsset(assetId);
  if (!asset) return false;
  return (
    ('mimeType' in asset.props && asset.props.mimeType?.includes('gif')) ||
    ('isAnimated' in asset.props && asset.props.isAnimated)
  );
}

function getFirstFrameOfAnimatedImage(url: string) {
  let cancelled = false;
  const promise = new Promise<string>((resolve) => {
    const image = new globalThis.Image();
    image.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(image, 0, 0);
      resolve(canvas.toDataURL());
    };
    image.crossOrigin = 'anonymous';
    image.src = url;
  });
  return {
    promise,
    cancel: () => {
      cancelled = true;
    },
  };
}

function BrokenImageIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <rect x="4" y="4" width="22" height="22" rx="3" />
      <circle cx="11" cy="11" r="2" />
      <path d="M4 20 l6-6 4 4 4-4 8 8" />
      <path d="M22 8 L8 22" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

function ImagePlaceholderIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      opacity="0.4"
    >
      <rect x="4" y="4" width="24" height="24" rx="3" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M4 22 l7-7 4 4 5-5 8 8" />
    </svg>
  );
}

const CustomImageShape = memo(function CustomImageShape({ shape }: { shape: TLImageShape }) {
  const editor = useEditor();

  const { w } = getUncroppedSize(shape.props, shape.props.crop);
  const { asset, url } = useImageOrVideoAsset({
    shapeId: shape.id,
    assetId: shape.props.assetId,
    width: w,
  });

  const prefersReducedMotion = usePrefersReducedMotion();
  const [staticFrameSrc, setStaticFrameSrc] = useState('');
  const [loadedUrl, setLoadedUrl] = useState<null | string>(null);
  const [imgError, setImgError] = useState(false);
  const isAnimated = asset && getIsAnimated(editor, asset.id);

  useEffect(() => {
    setImgError(false);
  }, [url]);

  useEffect(() => {
    if (url && isAnimated) {
      const { promise, cancel } = getFirstFrameOfAnimatedImage(url);
      promise.then((dataUrl) => {
        setStaticFrameSrc(dataUrl);
        setLoadedUrl(url);
      });
      return cancel;
    }
  }, [editor, isAnimated, prefersReducedMotion, url]);

  const showCropPreview = useValue(
    'show crop preview',
    () =>
      shape.id === editor.getOnlySelectedShapeId() &&
      editor.getCroppingShapeId() === shape.id &&
      editor.isIn('select.crop'),
    [editor, shape.id],
  );

  const reduceMotion =
    prefersReducedMotion && (asset?.props.mimeType?.includes('video') || isAnimated);

  const containerStyle = getCroppedContainerStyle(shape);
  const nextSrc = url === loadedUrl ? null : url;
  const loadedSrc = reduceMotion ? staticFrameSrc : loadedUrl;

  const isResolving = !url && !!asset?.props.src;
  const isMissing = !url && !asset?.props.src && !asset;
  const showError = (imgError || isMissing) && !loadedSrc;

  const crossOrigin = isAnimated ? ('anonymous' as const) : undefined;

  const handleLoad = useCallback((src: string) => {
    setLoadedUrl(src);
    setImgError(false);
  }, []);

  const handleError = useCallback(() => {
    setImgError(true);
  }, []);

  if (isResolving && !loadedSrc) {
    return (
      <HTMLContainer
        id={shape.id}
        style={{
          overflow: 'hidden',
          width: shape.props.w,
          height: shape.props.h,
        }}
      >
        <div
          className="flex size-full animate-pulse items-center justify-center rounded bg-gray-200"
          style={containerStyle}
        >
          <div className="pointer-events-none text-gray-400">
            <ImagePlaceholderIcon />
          </div>
        </div>
      </HTMLContainer>
    );
  }

  if (showError) {
    return (
      <HTMLContainer
        id={shape.id}
        style={{
          overflow: 'hidden',
          width: shape.props.w,
          height: shape.props.h,
        }}
      >
        <div
          className="flex size-full items-center justify-center rounded border border-dashed border-gray-300 bg-gray-100"
          style={containerStyle}
        >
          <div className="pointer-events-none flex flex-col items-center gap-1.5 text-gray-400">
            <BrokenImageIcon />
            <span className="text-[11px] select-none">Не удалось загрузить</span>
          </div>
        </div>
      </HTMLContainer>
    );
  }

  return (
    <>
      {showCropPreview && loadedSrc && (
        <div style={containerStyle}>
          <img
            className="tl-image"
            style={{ ...getFlipStyle(shape), opacity: 0.1 }}
            crossOrigin={crossOrigin}
            src={loadedSrc}
            referrerPolicy="strict-origin-when-cross-origin"
            draggable={false}
            alt=""
          />
        </div>
      )}
      <HTMLContainer
        id={shape.id}
        style={{
          overflow: 'hidden',
          width: shape.props.w,
          height: shape.props.h,
          borderRadius: shape.props.crop?.isCircle ? '50%' : undefined,
        }}
      >
        <div className="tl-image-container" style={containerStyle}>
          {loadedSrc && (
            <img
              key={loadedSrc}
              className="tl-image"
              style={getFlipStyle(shape)}
              crossOrigin={crossOrigin}
              src={loadedSrc}
              referrerPolicy="strict-origin-when-cross-origin"
              draggable={false}
              alt=""
            />
          )}
          {nextSrc && (
            <img
              key={nextSrc}
              className="tl-image"
              style={getFlipStyle(shape)}
              crossOrigin={crossOrigin}
              src={nextSrc}
              referrerPolicy="strict-origin-when-cross-origin"
              draggable={false}
              alt={shape.props.altText}
              onLoad={() => handleLoad(nextSrc)}
              onError={handleError}
            />
          )}
          {!loadedSrc && !nextSrc && (
            <div className="flex size-full animate-pulse items-center justify-center rounded bg-gray-200">
              <div className="pointer-events-none text-gray-400">
                <ImagePlaceholderIcon />
              </div>
            </div>
          )}
        </div>
        {'url' in shape.props && shape.props.url && (
          <a
            className="pointer-events-auto absolute top-1 right-1 z-1 flex size-[22px] items-center justify-center rounded bg-white/85 text-xs text-gray-700 no-underline opacity-0 transition-opacity hover:opacity-100"
            href={shape.props.url}
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
          >
            ↗
          </a>
        )}
      </HTMLContainer>
    </>
  );
});
