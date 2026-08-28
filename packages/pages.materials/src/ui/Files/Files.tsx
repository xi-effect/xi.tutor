import { RefObject, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
import { useMediaQuery } from '@xipkg/utils';
import { useCurrentUser, useSearchLibraryFiles } from 'common.services';
import { FileCard } from './Card';
import { FilesFilteredEmpty } from './FilesFilteredEmpty';
import { MaterialsGallerySkeleton } from '../MaterialsGallerySkeleton';
import { MaterialsTabEmptyState } from '../MaterialsTabEmptyState';
import { filterLibraryFiles, hasActiveFilesFilters } from '../../utils';
import type { FilesFiltersT } from '../../types';

type FilesProps = {
  parentRef: RefObject<HTMLDivElement | null>;
  filters: FilesFiltersT;
  onResetFilters: () => void;
};

export const Files = ({ parentRef, filters, onResetFilters }: FilesProps) => {
  const { t } = useTranslation('materials');
  const isMobile = useMediaQuery('(max-width: 960px)');
  const { data: user } = useCurrentUser();
  const { files, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSearchLibraryFiles();

  const filteredFiles = useMemo(
    () => filterLibraryFiles(files, filters, user?.id),
    [files, filters, user?.id],
  );

  const filtersActive = hasActiveFilesFilters(filters);

  useEffect(() => {
    const handleScroll = () => {
      if (!parentRef.current || isFetchingNextPage || !hasNextPage) return;

      const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
      if (scrollHeight - scrollTop - clientHeight < 120) {
        fetchNextPage();
      }
    };

    const element = parentRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [parentRef, fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (!filtersActive || isFetchingNextPage || !hasNextPage || filteredFiles.length > 0) {
      return;
    }
    fetchNextPage();
  }, [fetchNextPage, filteredFiles.length, filtersActive, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return <MaterialsGallerySkeleton />;
  }

  if (isError) {
    return <p className="text-s-base text-text-secondary py-10 text-center">{t('files.error')}</p>;
  }

  if (!files.length) {
    return (
      <MaterialsTabEmptyState
        title={t('empty.filesTitle')}
        description={t('empty.filesDescription')}
      />
    );
  }

  if (!filteredFiles.length) {
    return <FilesFilteredEmpty onReset={onResetFilters} />;
  }

  return (
    <GridVirtualizer
      parentRef={parentRef}
      items={filteredFiles}
      defaultRowHeight={176}
      minItemWidth={300}
      gap={20}
      maxColumns={4}
      isSingleColumn={isMobile}
      renderItem={(file) => <FileCard file={file} className="w-full" />}
    />
  );
};
