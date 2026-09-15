import { RefObject, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
import { useMediaQuery } from '@xipkg/utils';
import { useSearchLibraryFiles, type LibraryFile } from 'common.services';
import { FileCard } from './Card';
import { FilesFilteredEmpty } from './FilesFilteredEmpty';
import { FilePreviewModal } from './preview';
import { MaterialsGallerySkeleton } from '../MaterialsGallerySkeleton';
import { MaterialsTabEmptyState } from '../MaterialsTabEmptyState';
import { hasActiveFilesFilters, toLibraryFileSearchFilters } from '../../utils';
import { useParentScrollPagination } from '../../hooks';
import type { FilesFiltersT } from '../../types';

type FilesProps = {
  parentRef: RefObject<HTMLDivElement | null>;
  filters: FilesFiltersT;
  onResetFilters: () => void;
};

export const Files = ({ parentRef, filters, onResetFilters }: FilesProps) => {
  const { t } = useTranslation('materials');
  const isMobile = useMediaQuery('(max-width: 960px)');
  const [previewFile, setPreviewFile] = useState<LibraryFile | null>(null);
  const searchFilters = useMemo(() => toLibraryFileSearchFilters(filters), [filters]);
  const { files, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSearchLibraryFiles({ filters: searchFilters });

  const currentPreviewFile = useMemo(() => {
    if (!previewFile) {
      return null;
    }

    return files.find((item) => item.id === previewFile.id) ?? previewFile;
  }, [files, previewFile]);

  const filtersActive = hasActiveFilesFilters(filters);

  useParentScrollPagination({
    parentRef,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    itemsCount: files.length,
  });

  if (isLoading) {
    return <MaterialsGallerySkeleton />;
  }

  if (isError) {
    return <p className="text-s-base text-text-secondary py-10 text-center">{t('files.error')}</p>;
  }

  if (!files.length && !filtersActive) {
    return (
      <MaterialsTabEmptyState
        title={t('empty.filesTitle')}
        description={t('empty.filesDescription')}
      />
    );
  }

  if (!files.length) {
    return <FilesFilteredEmpty onReset={onResetFilters} />;
  }

  return (
    <>
      <GridVirtualizer
        parentRef={parentRef}
        items={files}
        defaultRowHeight={176}
        minItemWidth={300}
        gap={20}
        maxColumns={4}
        isSingleColumn={isMobile}
        renderItem={(file) => (
          <FileCard
            file={file}
            className="w-full"
            onPreview={(nextFile) => {
              window.setTimeout(() => setPreviewFile(nextFile), 0);
            }}
          />
        )}
      />
      <FilePreviewModal
        file={currentPreviewFile}
        files={files}
        onFileChange={setPreviewFile}
        onOpenChange={(open) => {
          if (!open) setPreviewFile(null);
        }}
      />
    </>
  );
};
