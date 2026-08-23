import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { Button } from '@xipkg/button';
import { Image } from '@xipkg/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import { useEditor } from '@ibodr/draw';
import { boardDropdownZClass, boardIconClass, boardMenuSurfaceClass } from '../../ui/boardTheme';
import { isFileNameTooLong, MAX_FILENAME_LENGTH, uploadImageRequest } from 'common.services';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { useYjsContext } from '../../providers/YjsContext';
import { checkAssetType } from '../../utils/uploadAsset';
import { isDisplayableAssetUrl, normalizeStoredFileSrc } from '../../utils/storedFileSrc';
import { resolveAssetUrl } from '../../utils/resolveAssetUrl';
import { IMAGE_INPUT_ACCEPT } from '../../constants/mimeTypes';

const MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024;

export function useActivityImageSrc(src?: string) {
  const { token } = useYjsContext();
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!src) {
      setUrl(null);
      return;
    }
    if (isDisplayableAssetUrl(src)) {
      setUrl(src);
      return;
    }

    let cancelled = false;
    resolveAssetUrl(src, token)
      .then((next) => {
        if (!cancelled) setUrl(next);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [src, token]);

  return url;
}

export function ActivityImage({
  src,
  className,
  alt = '',
}: {
  src?: string;
  className?: string;
  alt?: string;
}) {
  const url = useActivityImageSrc(src);
  if (!url) return null;
  return <img src={url} alt={alt} draggable={false} className={className} />;
}

function boardToast(key: string, options?: Record<string, unknown>) {
  return i18n.t(key, { ns: 'board', ...options });
}

async function uploadPickedImage(file: File, token: string) {
  const next = new File([file], file.name, { type: file.type, lastModified: file.lastModified });

  if (!next.size) {
    toast.error(boardToast('toast.fileEmpty'), { description: boardToast('toast.fileEmptyDesc') });
    throw new Error('empty');
  }

  if (next.size > MAX_IMAGE_SIZE_BYTES) {
    const description = boardToast('toast.imageSizeDesc', {
      size: (next.size / 1024 / 1024).toFixed(2),
    });
    toast.error(boardToast('toast.imageUploadFailed'), { description, duration: 5000 });
    throw new Error(description);
  }

  if (isFileNameTooLong(next.name)) {
    toast.error(boardToast('toast.fileNameTooLong'), {
      description: boardToast('toast.fileNameTooLongDesc', { max: MAX_FILENAME_LENGTH }),
    });
    throw new Error('name');
  }

  if (checkAssetType(next) !== 'img') {
    toast.error(boardToast('toast.imageUploadFailed'));
    throw new Error('type');
  }

  try {
    const fileId = await uploadImageRequest({ file: next, token });
    return normalizeStoredFileSrc(fileId);
  } catch (error) {
    toast.error(boardToast('toast.imageUploadFailed'));
    throw error;
  }
}

export function ActivityImageField({
  value,
  onChange,
  variant = 'compact',
  className,
  children,
  onSurfaceClick,
}: {
  value?: string;
  onChange: (src: string) => void;
  variant?: 'compact' | 'cover';
  className?: string;
  children?: ReactNode;
  onSurfaceClick?: (event: MouseEvent<HTMLDivElement>) => void;
}) {
  const { t } = useTranslation('board');
  const { token } = useYjsContext();
  const editor = useEditor();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const preview = useActivityImageSrc(value);

  const pick = () => {
    if (uploading) return;
    inputRef.current?.click();
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const fileId = await uploadPickedImage(file, token);
      onChange(fileId);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const stop = (event: SyntheticEvent) => {
    editor.markEventAsHandled(event);
    event.stopPropagation();
  };

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={IMAGE_INPUT_ACCEPT}
      className="hidden"
      data-board-control=""
      onPointerDown={stop}
      onChange={(event) => {
        void onFile(event.target.files?.[0]);
      }}
    />
  );

  if (variant === 'cover') {
    return (
      <div className={cn('flex min-h-40 flex-1 flex-col gap-2', className)}>
        {input}
        <div
          className="flex shrink-0 items-center gap-1"
          data-board-control=""
          onPointerDown={stop}
          onClick={stop}
        >
          <Button
            type="button"
            variant="secondary"
            size="s"
            className="h-8 min-h-8 px-3 text-xs"
            data-board-control=""
            disabled={uploading}
            onClick={pick}
          >
            {uploading
              ? t('activity.imageUploading')
              : value
                ? t('activity.changeImage')
                : t('activity.uploadImage')}
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="s"
              className="h-8 min-h-8 px-3 text-xs"
              data-board-control=""
              disabled={uploading}
              onClick={() => onChange('')}
            >
              {t('activity.removeImage')}
            </Button>
          ) : null}
        </div>
        <div
          className="bg-background-subtle relative min-h-40 flex-1 overflow-hidden rounded-xl"
          data-board-control={onSurfaceClick ? '' : undefined}
          onClick={onSurfaceClick}
        >
          {preview ? (
            <img src={preview} alt="" draggable={false} className="h-full w-full object-contain" />
          ) : (
            <div className="text-text-secondary flex h-full min-h-40 items-center justify-center px-4 text-center text-xs">
              {uploading ? t('activity.imageUploading') : t('activity.imagePlaceholder')}
            </div>
          )}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col gap-1', className)}
      data-board-control=""
      onPointerDown={stop}
    >
      {input}
      {preview ? (
        <img
          src={preview}
          alt=""
          draggable={false}
          className="h-16 w-full rounded object-contain"
        />
      ) : null}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="secondary"
          size="s"
          className="h-8 min-h-8 px-3 text-xs"
          data-board-control=""
          disabled={uploading}
          onClick={pick}
        >
          {uploading
            ? t('activity.imageUploading')
            : value
              ? t('activity.changeImage')
              : t('activity.uploadImage')}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="s"
            className="h-8 min-h-8 px-3 text-xs"
            data-board-control=""
            disabled={uploading}
            onClick={() => onChange('')}
          >
            {t('activity.removeImage')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

const fieldIconButtonClass =
  'text-text-primary hover:bg-background-hover data-[state=open]:bg-background-hover flex size-7 shrink-0 items-center justify-center rounded-lg p-0';

export function ActivityImageIconButton({
  value,
  onChange,
  className,
}: {
  value?: string;
  onChange: (src: string) => void;
  className?: string;
}) {
  const { t } = useTranslation('board');
  const { token } = useYjsContext();
  const editor = useEditor();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const preview = useActivityImageSrc(value);

  const pick = () => {
    if (uploading) return;
    inputRef.current?.click();
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const fileId = await uploadPickedImage(file, token);
      onChange(fileId);
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const stop = (event: SyntheticEvent) => {
    editor.markEventAsHandled(event);
    event.stopPropagation();
  };

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={IMAGE_INPUT_ACCEPT}
      className="hidden"
      data-board-control=""
      onPointerDown={stop}
      onChange={(event) => {
        void onFile(event.target.files?.[0]);
      }}
    />
  );

  const trigger = (
    <button
      type="button"
      data-board-control=""
      disabled={uploading}
      title={value ? t('activity.changeImage') : t('activity.uploadImage')}
      aria-label={value ? t('activity.changeImage') : t('activity.uploadImage')}
      className={cn(fieldIconButtonClass, uploading && 'opacity-50', className)}
      onPointerDown={stop}
      onClick={value ? undefined : pick}
    >
      {preview ? (
        <img src={preview} alt="" draggable={false} className="size-5 rounded object-cover" />
      ) : (
        <Image className={cn(boardIconClass, 'size-4')} />
      )}
    </button>
  );

  if (!value) {
    return (
      <>
        {input}
        {trigger}
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {input}
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={6}
        data-board-control=""
        onPointerDown={stop}
        className={cn(
          boardMenuSurfaceClass,
          boardDropdownZClass,
          'pointer-events-auto z-80 flex w-44 flex-col gap-2 rounded-xl p-2',
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt=""
            draggable={false}
            className="h-20 w-full rounded-lg object-contain"
          />
        ) : null}
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            variant="secondary"
            size="s"
            className="h-8 min-h-8 px-3 text-xs"
            data-board-control=""
            disabled={uploading}
            onClick={pick}
          >
            {uploading ? t('activity.imageUploading') : t('activity.changeImage')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="s"
            className="h-8 min-h-8 px-3 text-xs"
            data-board-control=""
            disabled={uploading}
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
          >
            {t('activity.removeImage')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
