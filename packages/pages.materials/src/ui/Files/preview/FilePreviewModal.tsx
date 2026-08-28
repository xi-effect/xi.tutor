import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Modal, ModalBody, ModalContent, ModalDescription } from '@xipkg/modal';
import { cn } from '@xipkg/utils';
import { ConfirmDialog, getAppLanguage } from 'common.ui';
import { useDeleteLibraryFile, type LibraryFile } from 'common.services';
import { useTranslation } from 'react-i18next';
import { downloadLibraryFile, formatFileSize, getLibraryFileDisplayName } from '../../../utils';
import { AudioPreview } from './AudioPreview';
import { FilePreviewError } from './FilePreviewError';
import { FilePreviewHeader } from './FilePreviewHeader';
import { FilePreviewLoading } from './FilePreviewLoading';
import { FilePreviewUnsupported } from './FilePreviewUnsupported';
import { formatMediaTime } from './formatMediaTime';
import { canPreviewFullscreen, getExtensionLabel, getFilePreviewKind } from './getFilePreviewKind';
import { ImagePreview } from './ImagePreview';
import { PdfPreview } from './PdfPreview';
import { PresentationPreview } from './PresentationPreview';
import {
  PREVIEW_AUDIO_FRAME_CLASS,
  PREVIEW_STAGE_CLASS,
  usePreviewWindowSize,
} from './previewFrame';
import { previewFullscreenTransition } from './previewMotion';
import { useLibraryFileBlob } from './useLibraryFileBlob';

const cleanupBodyScrollLock = () => {
  document.body.style.overflow = '';
  document.body.style.pointerEvents = '';
  document.body.removeAttribute('data-scroll-locked');
};

const DISMISS_GUARD_MS = 500;

type FilePreviewModalProps = {
  file: LibraryFile | null;
  onOpenChange: (open: boolean) => void;
};

export const FilePreviewModal = ({ file, onOpenChange }: FilePreviewModalProps) => {
  const { t } = useTranslation('materials');
  const open = Boolean(file);
  const previewKind = file ? getFilePreviewKind(file) : 'unsupported';
  const needsBlob = previewKind !== 'unsupported';
  const dismissGuardUntilRef = useRef(0);
  const windowSize = usePreviewWindowSize();

  const { blob, blobUrl, isLoading, isError, refetch } = useLibraryFileBlob(
    open && file && needsBlob ? file.id : null,
  );
  const deleteMutation = useDeleteLibraryFile();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renderError, setRenderError] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  const displayName = file ? getLibraryFileDisplayName(file) : '';
  const extensionLabel = file ? getExtensionLabel(file) : '';

  useEffect(() => {
    setIsFullscreen(false);
    setDeleteOpen(false);
    setImageSize(null);
    setAudioDuration(null);
  }, [file?.id]);

  useEffect(() => {
    setRenderError(false);
  }, [blobUrl]);

  useEffect(() => {
    if (open) {
      dismissGuardUntilRef.current = Date.now() + DISMISS_GUARD_MS;
    } else {
      setIsFullscreen(false);
      cleanupBodyScrollLock();
    }
    return cleanupBodyScrollLock;
  }, [open]);

  const isDismissGuarded = () => Date.now() < dismissGuardUntilRef.current;

  const handleClose = () => {
    setIsFullscreen(false);
    cleanupBodyScrollLock();
    onOpenChange(false);
  };

  const handleDownload = async () => {
    if (!file) return;
    setIsDownloading(true);
    try {
      await downloadLibraryFile(file.id, displayName);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRenderError = useCallback(() => {
    setRenderError(true);
  }, []);

  const handleRetry = () => {
    setRenderError(false);
    void refetch();
  };

  const showError = isError || renderError;
  const showUnsupported = previewKind === 'unsupported';
  const showFullscreen = Boolean(file) && canPreviewFullscreen(previewKind) && !showError;
  const effectiveFullscreen = isFullscreen && showFullscreen;

  const subtitle = useMemo(() => {
    if (!file) return '';

    if (previewKind === 'image' && imageSize) {
      return `${extensionLabel} · ${imageSize.width} × ${imageSize.height}`;
    }

    if (previewKind === 'audio' && audioDuration != null) {
      return `${extensionLabel} · ${formatMediaTime(audioDuration)}`;
    }

    return `${extensionLabel} · ${formatFileSize(file.size_bytes, getAppLanguage())}`;
  }, [audioDuration, extensionLabel, file, imageSize, previewKind]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) handleClose();
  };

  const stageClass = previewKind === 'audio' ? undefined : PREVIEW_STAGE_CLASS;

  return (
    <>
      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalContent
          className={cn(
            'fixed inset-0 top-0 left-0 m-0 flex h-dvh max-h-dvh w-screen max-w-none translate-x-0 translate-y-0 items-center justify-center overflow-hidden border-0 bg-transparent p-0 shadow-none',
            'duration-200',
            'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
            'data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100',
            'data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0',
            'data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0',
          )}
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement).focus({ preventScroll: true });
          }}
          onEscapeKeyDown={(event) => {
            if (effectiveFullscreen) {
              event.preventDefault();
              setIsFullscreen(false);
            }
          }}
          onClick={(event) => {
            if (effectiveFullscreen || isDismissGuarded()) return;
            if (event.target === event.currentTarget) handleClose();
          }}
          onPointerDownOutside={(event) => {
            if (isDismissGuarded() || effectiveFullscreen) {
              event.preventDefault();
            }
          }}
          onInteractOutside={(event) => {
            const target = event.target as HTMLElement | null;
            if (
              target?.closest('[data-radix-popper-content-wrapper]') ||
              target?.closest('[data-radix-dropdown-menu-content]') ||
              target?.closest('[role="menu"]')
            ) {
              event.preventDefault();
            }
            if (isDismissGuarded() || effectiveFullscreen) {
              event.preventDefault();
            }
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            cleanupBodyScrollLock();
          }}
        >
          {file ? (
            <motion.div
              initial={false}
              animate={
                previewKind === 'audio'
                  ? undefined
                  : effectiveFullscreen
                    ? {
                        width: windowSize.viewportWidth,
                        height: windowSize.viewportHeight,
                        borderRadius: 0,
                      }
                    : {
                        width: windowSize.width,
                        height: windowSize.height,
                        borderRadius: 24,
                      }
              }
              transition={previewFullscreenTransition}
              className={cn(
                'flex flex-col overflow-hidden',
                effectiveFullscreen
                  ? 'bg-neutral-950'
                  : cn(
                      'bg-background-surface',
                      previewKind === 'audio' && PREVIEW_AUDIO_FRAME_CLASS,
                    ),
              )}
              onClick={(event) => event.stopPropagation()}
            >
              <FilePreviewHeader
                title={displayName}
                subtitle={subtitle}
                kind={previewKind}
                isFullscreen={effectiveFullscreen}
                showFullscreen={showFullscreen}
                showMore
                isDownloading={isDownloading}
                onDownload={handleDownload}
                onToggleFullscreen={() => setIsFullscreen((value) => !value)}
                onDelete={() => setDeleteOpen(true)}
                onClose={handleClose}
              />
              <ModalDescription className="sr-only">{subtitle}</ModalDescription>
              <ModalBody
                className={cn(
                  'min-h-0 flex-1',
                  previewKind === 'audio' ? '' : 'flex flex-col',
                  effectiveFullscreen ? 'bg-transparent p-6 pt-0' : 'p-6',
                )}
              >
                {showUnsupported ? (
                  <FilePreviewUnsupported
                    className={stageClass}
                    onDownload={handleDownload}
                    isDownloading={isDownloading}
                  />
                ) : showError ? (
                  <FilePreviewError
                    className={stageClass}
                    onRetry={handleRetry}
                    onDownload={handleDownload}
                    isDownloading={isDownloading}
                  />
                ) : isLoading || (previewKind === 'pdf' ? !blob : !blobUrl) ? (
                  <FilePreviewLoading isFullscreen={effectiveFullscreen} className={stageClass} />
                ) : previewKind === 'image' && blobUrl ? (
                  <ImagePreview
                    blobUrl={blobUrl}
                    fileName={displayName}
                    isFullscreen={effectiveFullscreen}
                    onDimensions={(width, height) => setImageSize({ width, height })}
                    onError={handleRenderError}
                  />
                ) : previewKind === 'audio' && blobUrl ? (
                  <AudioPreview
                    blobUrl={blobUrl}
                    onDuration={setAudioDuration}
                    onError={handleRenderError}
                  />
                ) : previewKind === 'pdf' && blob ? (
                  <PdfPreview
                    source={blob}
                    isFullscreen={effectiveFullscreen}
                    onError={handleRenderError}
                  />
                ) : previewKind === 'pdf' ? (
                  <FilePreviewLoading isFullscreen={effectiveFullscreen} className={stageClass} />
                ) : blobUrl ? (
                  <PresentationPreview
                    blobUrl={blobUrl}
                    isFullscreen={effectiveFullscreen}
                    onError={handleRenderError}
                  />
                ) : (
                  <FilePreviewLoading isFullscreen={effectiveFullscreen} className={stageClass} />
                )}
              </ModalBody>
            </motion.div>
          ) : null}
        </ModalContent>
      </Modal>

      {file ? (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={t('files.deleteConfirm.title')}
          description={t('files.deleteConfirm.description', { name: displayName })}
          confirmLabel={
            deleteMutation.isPending
              ? t('files.deleteConfirm.deleting')
              : t('files.deleteConfirm.confirm')
          }
          cancelLabel={t('files.deleteConfirm.cancel')}
          onConfirm={() => {
            deleteMutation.mutate(file.id, {
              onSuccess: () => handleClose(),
            });
          }}
          isPending={deleteMutation.isPending}
        />
      ) : null}
    </>
  );
};
