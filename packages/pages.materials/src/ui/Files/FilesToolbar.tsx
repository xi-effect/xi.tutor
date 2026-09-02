import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';
import { FilesTypeFilter } from './FilesTypeFilter';
import { FilesTagsFilter } from './FilesTagsFilter';
import { FilesUploaderFilter } from './FilesUploaderFilter';
import { hasActiveFilesFilters } from '../../utils';
import type { FilesFiltersT } from '../../types';

type FilesToolbarProps = {
  filters: FilesFiltersT;
  onChange: (filters: FilesFiltersT) => void;
  onReset: () => void;
};

export const FilesToolbar = ({ filters, onChange, onReset }: FilesToolbarProps) => {
  const { t } = useTranslation('materials');
  const showReset = hasActiveFilesFilters(filters);

  return (
    <div className="flex w-full flex-wrap items-center gap-3">
      <FilesUploaderFilter
        value={filters.uploader}
        onChange={(uploader) => onChange({ ...filters, uploader })}
      />
      <FilesTypeFilter
        value={filters.kinds}
        onChange={(kinds) => onChange({ ...filters, kinds })}
      />
      <FilesTagsFilter value={filters.tags} onChange={(tags) => onChange({ ...filters, tags })} />
      {showReset ? (
        <Button
          type="button"
          variant="ghost"
          className="text-s-base text-text-link hover:text-text-link h-auto px-2 py-1 font-medium"
          onClick={onReset}
          data-umami-event="materials-files-reset-all"
        >
          {t('files.resetAll')}
        </Button>
      ) : null}
    </div>
  );
};
