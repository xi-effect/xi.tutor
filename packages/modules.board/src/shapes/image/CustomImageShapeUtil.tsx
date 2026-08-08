import {
  ImageShapeUtil as DrawImageShapeUtil,
  DrImageShape,
  HTMLContainer,
  useEditor,
  useImageOrVideoAsset,
  getUncroppedSize,
  usePrefersReducedMotion,
  useValue,
  DrAssetId,
  Editor,
} from '@ibodr/draw';
import { memo, useCallback, useEffect, useState } from 'react';
import i18n from 'i18next';
import {
  blobOrUrlToDataUrl,
  getBoardStorageToken,
  getSvgExportRasterScale,
  resolveSrcForSvgExport,
} from '../../utils/shapeSvgExport';

export class CustomImageShapeUtil extends DrawImageShapeUtil {
  override component(shape: DrImageShape) {
    return <CustomImageShape shape={shape} />;
  }

  override async toSvg(
    shape: DrImageShape,
    ctx: {
      resolveAssetUrl: (assetId: DrAssetId, width: number) => Promise<string | null>;
      scale?: number;
      pixelRatio?: number | null;
    },
  ) {
    const props = shape.props;
    if (!props.assetId) return null;

    const asset = this.editor.getAsset(props.assetId);
    if (!asset) return null;

    const rasterScale = getSvgExportRasterScale(ctx);
    const { w } = getUncroppedSize(shape.props, props.crop);
    let sourceUrl: string | null = null;

    try {
      // Просим ассет шире, чтобы в PNG не апскейлить размытую копию.
      const resolved = await ctx.resolveAssetUrl(asset.id, w * rasterScale);
      if (resolved?.startsWith('data:')) {
        sourceUrl = resolved;
      } else if (resolved) {
        sourceUrl = (await blobOrUrlToDataUrl(resolved)) ?? resolved;
      }
    } catch (error) {
      console.error('[CustomImageShapeUtil.toSvg] resolveAssetUrl failed:', error);
    }

    if (!sourceUrl && 'src' in asset.props && asset.props.src) {
      sourceUrl = await resolveSrcForSvgExport(String(asset.props.src), getBoardStorageToken());
    }

    if (!sourceUrl) return null;

    const exported = await rasterizeImageShapeForExport(shape, sourceUrl, rasterScale);
    if (!exported) return null;

    return <image href={exported} width={props.w} height={props.h} aria-label={props.altText} />;
  }
}

/** Рисует image-шейп (с crop/circle/flip) в PNG data:URL — без foreignObject и SafeId. */
function rasterizeImageShapeForExport(
  shape: DrImageShape,
  src: string,
  rasterScale = 1,
): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const { w: outW, h: outH } = shape.props;
        const crop = shape.props.crop;
        const dpr = Math.max(1, rasterScale);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(outW * dpr));
        canvas.height = Math.max(1, Math.round(outH * dpr));
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }

        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.save();
        if (crop?.isCircle) {
          ctx.beginPath();
          ctx.ellipse(outW / 2, outH / 2, outW / 2, outH / 2, 0, 0, Math.PI * 2);
          ctx.clip();
        }

        const { flipX, flipY } = shape.props;
        if (flipX || flipY) {
          ctx.translate(flipX ? outW : 0, flipY ? outH : 0);
          ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        }

        if (crop) {
          const sx = crop.topLeft.x * img.naturalWidth;
          const sy = crop.topLeft.y * img.naturalHeight;
          const sw = (crop.bottomRight.x - crop.topLeft.x) * img.naturalWidth;
          const sh = (crop.bottomRight.y - crop.topLeft.y) * img.naturalHeight;
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
        } else {
          ctx.drawImage(img, 0, 0, outW, outH);
        }

        ctx.restore();
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function getCroppedContainerStyle(shape: DrImageShape) {
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

function getFlipStyle(shape: DrImageShape) {
  const { flipX, flipY } = shape.props;
  if (!flipX && !flipY) return undefined;
  return {
    transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
    transformOrigin: 'center center',
  };
}

function getIsAnimated(editor: Editor, assetId: DrAssetId) {
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

const CustomImageShape = memo(function CustomImageShape({ shape }: { shape: DrImageShape }) {
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
          className="bg-background-subtle flex size-full animate-pulse items-center justify-center rounded"
          style={containerStyle}
        >
          <div className="text-text-secondary pointer-events-none">
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
          className="border-border-default bg-background-page flex size-full items-center justify-center rounded border border-dashed"
          style={containerStyle}
        >
          <div className="text-text-secondary pointer-events-none flex flex-col items-center gap-1.5">
            <BrokenImageIcon />
            <span className="text-[11px] select-none">
              {i18n.t('file.loadFailed', { ns: 'board' })}
            </span>
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
            className="dr-image"
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
        <div className="dr-image-container" style={containerStyle}>
          {loadedSrc && (
            <img
              key={loadedSrc}
              className="dr-image"
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
              className="dr-image"
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
            <div className="bg-background-subtle flex size-full animate-pulse items-center justify-center rounded">
              <div className="text-text-secondary pointer-events-none">
                <ImagePlaceholderIcon />
              </div>
            </div>
          )}
        </div>
        {'url' in shape.props && shape.props.url && (
          <a
            className="bg-background-surface/85 text-text-primary pointer-events-auto absolute top-1 right-1 z-1 flex size-[22px] items-center justify-center rounded text-xs no-underline opacity-0 transition-opacity hover:opacity-100"
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
