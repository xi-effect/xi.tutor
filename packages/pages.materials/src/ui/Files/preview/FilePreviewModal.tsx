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
import { FilePreviewNav } from './FilePreviewNav';
import { FilePreviewUnsupported } from './FilePreviewUnsupported';
import {
  readFilePreviewFullscreen,
  writeFilePreviewFullscreen,
} from './filePreviewFullscreenStore';
import { ShareFileModal } from '../ShareFileModal';
import { RenameFileModal } from '../RenameFileModal';
import { useLibraryTagsManage } from '../tags/libraryTagsUiStore';
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
import { useLibraryFileBlob, type FileContentSource } from './useLibraryFileBlob';

const cleanupBodyScrollLock = () => {
  document.body.style.overflow = '';
  document.body.style.pointerEvents = '';
  document.body.removeAttribute('data-scroll-locked');
};

const DISMISS_GUARD_MS = 500;

type FilePreviewModalProps = {
  file: LibraryFile | null;
  files?: LibraryFile[];
  onOpenChange: (open: boolean) => void;
  onFileChange?: (file: LibraryFile) => void;
  readOnly?: boolean;
  contentSource?: FileContentSource;
  deleteLabel?: string;
  deleteTitle?: string;
  deleteDescription?: string;
  onDeleteFile?: (fileId: string) => void;
  hideLibraryActions?: boolean;
  primaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
  };
};

export const FilePreviewModal = ({
  file,
  files,
  onOpenChange,
  onFileChange,
  readOnly = false,
  contentSource = { type: 'library' },
  deleteLabel,
  deleteTitle,
  deleteDescription,
  onDeleteFile,
  hideLibraryActions = false,
  primaryAction,
}: FilePreviewModalProps) => {
  const { t } = useTranslation('materials');
  const open = Boolean(file);
  const previewKind = file ? getFilePreviewKind(file) : 'unsupported';
  const needsBlob = previewKind !== 'unsupported';
  const dismissGuardUntilRef = useRef(0);
  const wasOpenRef = useRef(false);
  const windowSize = usePreviewWindowSize();

  const { blob, blobUrl, isLoading, isError, refetch } = useLibraryFileBlob(
    open && file && needsBlob ? file.id : null,
    contentSource,
  );
  const deleteMutation = useDeleteLibraryFile();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const { manageOpen } = useLibraryTagsManage();
  const [renderError, setRenderError] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);

  const displayName = file ? getLibraryFileDisplayName(file) : '';
  const extensionLabel = file ? getExtensionLabel(file) : '';

  const fileIndex = useMemo(() => {
    if (!file || !files?.length) return -1;
    return files.findIndex((item) => item.id === file.id);
  }, [file, files]);

  const hasPrev = Boolean(onFileChange && files && fileIndex > 0);
  const hasNext = Boolean(onFileChange && files && fileIndex >= 0 && fileIndex < files.length - 1);

  const setFullscreen = useCallback((value: boolean) => {
    setIsFullscreen(value);
    writeFilePreviewFullscreen(value);
  }, []);

  const goToSibling = useCallback(
    (direction: -1 | 1) => {
      if (!onFileChange || !files || fileIndex < 0) return;
      const next = files[fileIndex + direction];
      if (next) onFileChange(next);
    },
    [fileIndex, files, onFileChange],
  );

  useEffect(() => {
    setDeleteOpen(false);
    setShareOpen(false);
    setRenameOpen(false);
    setTagsOpen(false);
    setImageSize(null);
    setAudioDuration(null);
  }, [file?.id]);

  useEffect(() => {
    setRenderError(false);
  }, [blobUrl]);

  useEffect(() => {
    if (open && !wasOpenRef.current && file) {
      const preferred = readFilePreviewFullscreen();
      setIsFullscreen(preferred && canPreviewFullscreen(getFilePreviewKind(file)));
      dismissGuardUntilRef.current = Date.now() + DISMISS_GUARD_MS;
    }

    if (!open && wasOpenRef.current) {
      setIsFullscreen(false);
      cleanupBodyScrollLock();
    }

    wasOpenRef.current = open;
    return cleanupBodyScrollLock;
  }, [open, file]);

  useEffect(() => {
    if (!open || !file || !isFullscreen) return;
    if (!canPreviewFullscreen(getFilePreviewKind(file))) {
      setFullscreen(false);
    }
  }, [file, isFullscreen, open, setFullscreen]);

  useEffect(() => {
    if (!open || !isFullscreen || !onFileChange || !files?.length) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest('input, textarea, select, [contenteditable="true"]') ||
        deleteOpen ||
        shareOpen ||
        renameOpen ||
        tagsOpen ||
        manageOpen
      ) {
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToSibling(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToSibling(1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    deleteOpen,
    goToSibling,
    isFullscreen,
    manageOpen,
    onFileChange,
    open,
    renameOpen,
    shareOpen,
    tagsOpen,
    files?.length,
  ]);

  const isDismissGuarded = () => Date.now() < dismissGuardUntilRef.current;

  const handleClose = () => {
    cleanupBodyScrollLock();
    onOpenChange(false);
  };

  const handleDownload = async () => {
    if (!file) return;
    setIsDownloading(true);
    try {
      await downloadLibraryFile(file.id, displayName, contentSource);
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
  const showFileNav = effectiveFullscreen && Boolean(onFileChange && files && files.length > 1);

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

  const stageClass =
    previewKind === 'audio' && !effectiveFullscreen ? undefined : PREVIEW_STAGE_CLASS;
  const overlayOpen = shareOpen || renameOpen || tagsOpen || manageOpen;

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
              setFullscreen(false);
            }
          }}
          onClick={(event) => {
            if (effectiveFullscreen || isDismissGuarded() || overlayOpen) return;
            if (event.target === event.currentTarget) handleClose();
          }}
          onPointerDownOutside={(event) => {
            if (isDismissGuarded() || effectiveFullscreen || overlayOpen) {
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
            if (isDismissGuarded() || effectiveFullscreen || overlayOpen) {
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
                previewKind === 'audio' && !effectiveFullscreen
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
                'relative flex flex-col overflow-hidden',
                effectiveFullscreen
                  ? 'bg-background-page'
                  : cn(
                      'bg-background-surface',
                      previewKind === 'audio' && PREVIEW_AUDIO_FRAME_CLASS,
                    ),
              )}
              onClick={(event) => event.stopPropagation()}
            >
              <FilePreviewHeader
                file={file}
                title={displayName}
                subtitle={subtitle}
                kind={previewKind}
                isFullscreen={effectiveFullscreen}
                showFullscreen={showFullscreen}
                showMore={!readOnly}
                showDownload
                deleteLabel={deleteLabel}
                isDownloading={isDownloading}
                tagsOpen={tagsOpen}
                onTagsOpenChange={setTagsOpen}
                onDownload={handleDownload}
                onToggleFullscreen={() => setFullscreen(!isFullscreen)}
                onDelete={() => setDeleteOpen(true)}
                onShare={hideLibraryActions ? undefined : () => setShareOpen(true)}
                onRename={readOnly ? undefined : () => setRenameOpen(true)}
                onClose={handleClose}
                primaryAction={primaryAction}
              />
              <ModalDescription className="sr-only">{subtitle}</ModalDescription>
              <ModalBody
                className={cn(
                  'relative min-h-0 flex-1',
                  previewKind === 'audio' && !effectiveFullscreen ? '' : 'flex flex-col',
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
                    isFullscreen={effectiveFullscreen}
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
                {showFileNav ? (
                  <FilePreviewNav
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    onPrev={() => goToSibling(-1)}
                    onNext={() => goToSibling(1)}
                  />
                ) : null}
              </ModalBody>
            </motion.div>
          ) : null}
        </ModalContent>
      </Modal>

      {file ? <RenameFileModal file={file} open={renameOpen} onOpenChange={setRenameOpen} /> : null}

      {file ? <ShareFileModal file={file} open={shareOpen} onOpenChange={setShareOpen} /> : null}

      {file ? (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={deleteTitle ?? t('files.deleteConfirm.title')}
          description={
            deleteDescription ?? t('files.deleteConfirm.description', { name: displayName })
          }
          confirmLabel={
            deleteMutation.isPending
              ? t('files.deleteConfirm.deleting')
              : (deleteLabel ?? t('files.deleteConfirm.confirm'))
          }
          cancelLabel={t('files.deleteConfirm.cancel')}
          onConfirm={() => {
            if (onDeleteFile) {
              onDeleteFile(file.id);
              handleClose();
              return;
            }
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
