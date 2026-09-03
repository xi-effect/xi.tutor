import { useEffect, useMemo, useRef, useState } from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { Button } from '@xipkg/button';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
import { Close } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useSearchLibraryFiles, type LibraryFile } from 'common.services';
import { useTranslation } from 'react-i18next';
import { DEFAULT_FILES_FILTERS, type FilesFiltersT } from '../../../types';
import {
  filterLibraryFiles,
  hasActiveFilesFilters,
  hasClientFilesFilters,
  toLibraryFileSearchFilters,
} from '../../../utils';
import { FilePreviewModal } from '../preview';
import { FilesFilteredEmpty } from '../FilesFilteredEmpty';
import { FilesTagsFilter } from '../FilesTagsFilter';
import { FilesTypeFilter } from '../FilesTypeFilter';
import { FilesUploaderFilter } from '../FilesUploaderFilter';
import { LibraryTagsUiProvider } from '../tags/LibraryTagsUiContext';
import { CloudFileRow } from './CloudFileRow';

export type CloudFilesPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (file: LibraryFile) => void | Promise<void>;
  addLabel: string;
  description?: string;
  overlayClassName?: string;
  contentClassName?: string;
  chromeClassName?: string;
  umamiPrefix?: string;
};

const CloudFilesPickerContent = ({
  open,
  onOpenChange,
  onSelect,
  addLabel,
  description,
  overlayClassName,
  contentClassName,
  umamiPrefix = 'cloud',
}: CloudFilesPickerProps) => {
  const { t } = useTranslation('materials');
  const parentRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<FilesFiltersT>(DEFAULT_FILES_FILTERS);
  const [insertingId, setInsertingId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<LibraryFile | null>(null);
  const searchFilters = useMemo(() => toLibraryFileSearchFilters(filters), [filters]);

  const { files, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSearchLibraryFiles({ enabled: open, limit: 24, filters: searchFilters });

  const filteredFiles = useMemo(() => filterLibraryFiles(files, filters), [files, filters]);

  const currentPreviewFile = useMemo(() => {
    if (!previewFile) return null;
    return filteredFiles.find((item) => item.id === previewFile.id) ?? previewFile;
  }, [filteredFiles, previewFile]);

  const filtersActive = hasActiveFilesFilters(filters);
  const clientFiltersActive = hasClientFilesFilters(filters);
  const title = t('files.cloudPicker.title');
  const descriptionText = description ?? t('files.cloudPicker.description');

  useEffect(() => {
    if (
      !open ||
      !clientFiltersActive ||
      isFetchingNextPage ||
      !hasNextPage ||
      filteredFiles.length > 0
    ) {
      return;
    }
    fetchNextPage();
  }, [
    clientFiltersActive,
    fetchNextPage,
    filteredFiles.length,
    hasNextPage,
    isFetchingNextPage,
    open,
  ]);

  const handleAdd = async (file: LibraryFile) => {
    if (insertingId) return;
    setInsertingId(file.id);
    try {
      await onSelect(file);
      setPreviewFile(null);
      onOpenChange(false);
    } finally {
      setInsertingId(null);
    }
  };

  const handleListScroll = () => {
    if (!parentRef.current || isFetchingNextPage || !hasNextPage) return;
    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    if (scrollHeight - scrollTop - clientHeight < 120) {
      fetchNextPage();
    }
  };

  return (
    <>
      <DrawerPrimitive.Root
        direction="right"
        open={open}
        onOpenChange={(next) => {
          if (!next) setPreviewFile(null);
          onOpenChange(next);
        }}
        shouldScaleBackground={false}
      >
        <DrawerPrimitive.Portal>
          <DrawerPrimitive.Overlay
            className={cn('bg-background-overlay fixed inset-0 z-50', overlayClassName)}
          />
          <DrawerPrimitive.Content
            data-cloud-files-drawer
            className={cn(
              'bg-background-surface border-border-default fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-lg flex-col rounded-tl-2xl rounded-bl-2xl border-l outline-none',
              contentClassName,
            )}
          >
            <div className="border-border-default flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
              <DrawerPrimitive.Title className="font-playfair text-text-primary m-0 text-xl font-medium">
                {title}
              </DrawerPrimitive.Title>
              <DrawerPrimitive.Description className="sr-only">
                {descriptionText}
              </DrawerPrimitive.Description>
              <button
                type="button"
                className="hover:bg-background-page flex size-8 shrink-0 items-center justify-center rounded-lg"
                onClick={() => onOpenChange(false)}
                aria-label={t('files.cloudPicker.close')}
              >
                <Close className="fill-icon-primary size-5" />
              </button>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2 px-4 py-2.5">
              <FilesUploaderFilter
                value={filters.uploader}
                onChange={(uploader) => setFilters((prev) => ({ ...prev, uploader }))}
              />
              <FilesTypeFilter
                value={filters.kinds}
                onChange={(kinds) => setFilters((prev) => ({ ...prev, kinds }))}
              />
              <FilesTagsFilter
                value={filters.tags}
                onChange={(tags) => setFilters((prev) => ({ ...prev, tags }))}
              />
              {filtersActive ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-s-base text-text-link hover:text-text-link h-auto px-2 py-1 font-medium"
                  onClick={() => setFilters(DEFAULT_FILES_FILTERS)}
                  data-umami-event={`${umamiPrefix}-cloud-files-reset-all`}
                >
                  {t('files.resetAll')}
                </Button>
              ) : null}
            </div>

            <div
              ref={parentRef}
              className="min-h-0 flex-1 overflow-y-auto px-3 pb-4"
              aria-label={title}
              onScroll={handleListScroll}
            >
              {isLoading ? (
                <p className="text-s-base text-text-secondary py-10 text-center">
                  {t('files.cloudPicker.loading')}
                </p>
              ) : isError ? (
                <p className="text-s-base text-text-secondary py-10 text-center">
                  {t('files.cloudPicker.error')}
                </p>
              ) : !files.length ? (
                <p className="text-s-base text-text-secondary py-10 text-center">
                  {t('files.cloudPicker.empty')}
                </p>
              ) : !filteredFiles.length ? (
                <FilesFilteredEmpty onReset={() => setFilters(DEFAULT_FILES_FILTERS)} />
              ) : (
                <>
                  <GridVirtualizer
                    parentRef={parentRef}
                    items={filteredFiles}
                    isSingleColumn
                    defaultRowHeight={56}
                    gap={0}
                    overscan={8}
                    renderItem={(file) => (
                      <div className="border-border-default border-b">
                        <CloudFileRow
                          file={file}
                          addLabel={addLabel}
                          disabled={insertingId === file.id}
                          previewOpen={Boolean(previewFile)}
                          umamiPrefix={umamiPrefix}
                          onPreview={setPreviewFile}
                          onAdd={(next) => {
                            void handleAdd(next);
                          }}
                        />
                      </div>
                    )}
                  />
                  {isFetchingNextPage ? (
                    <p className="text-s-base text-text-secondary py-2 text-center">
                      {t('files.cloudPicker.loading')}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Portal>
      </DrawerPrimitive.Root>

      <FilePreviewModal
        file={currentPreviewFile}
        files={filteredFiles}
        readOnly
        onFileChange={setPreviewFile}
        onOpenChange={(next) => {
          if (!next) setPreviewFile(null);
        }}
        primaryAction={
          currentPreviewFile
            ? {
                label: addLabel,
                loading: insertingId === currentPreviewFile.id,
                onClick: () => {
                  void handleAdd(currentPreviewFile);
                },
              }
            : undefined
        }
      />
    </>
  );
};

export const CloudFilesPicker = (props: CloudFilesPickerProps) => (
  <LibraryTagsUiProvider>
    <div className={props.chromeClassName}>
      <CloudFilesPickerContent {...props} />
    </div>
  </LibraryTagsUiProvider>
);
