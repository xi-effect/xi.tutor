import { useEffect, useState } from 'react';
import { Button } from '@xipkg/button';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import type { FileKind } from 'common.api';
import { useTranslation } from 'react-i18next';
import { FILE_TYPE_OPTIONS } from '../../utils';
import { MaterialsFilterOption } from '../MaterialsFilterOption';
import { FilesFilterChip } from './FilesFilterChip';

type FilesTypeFilterProps = {
  value: FileKind[];
  onChange: (kinds: FileKind[]) => void;
};

export const FilesTypeFilter = ({ value, onChange }: FilesTypeFilterProps) => {
  const { t } = useTranslation('materials');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FileKind[]>(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
    }
  }, [open, value]);

  const toggleKind = (kind: FileKind) => {
    setDraft((current) =>
      current.includes(kind) ? current.filter((item) => item !== kind) : [...current, kind],
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FilesFilterChip open={open} umamiEvent="materials-files-type-filter">
          {value.length > 0
            ? t('files.type.chipCount', { count: value.length })
            : t('files.type.chip')}
        </FilesFilterChip>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="border-border-default bg-background-surface w-60 rounded-2xl border p-4 shadow-[0px_4px_16px_rgba(0,0,0,0.08)]"
      >
        <div className="flex w-full flex-col items-stretch gap-3 bg-transparent">
          {FILE_TYPE_OPTIONS.map((kind) => (
            <MaterialsFilterOption
              key={kind}
              variant="checkbox"
              selected={draft.includes(kind)}
              onSelect={() => toggleKind(kind)}
              umamiEvent="materials-files-type-option"
              umamiScope={kind}
            >
              {t(`files.type.${kind}`)}
            </MaterialsFilterOption>
          ))}
        </div>
        <div className="border-border-default mt-4 flex items-center justify-between border-t pt-3">
          <Button
            type="button"
            variant="ghost"
            className="text-s-base text-text-secondary h-auto px-3 py-2 font-medium"
            onClick={() => setDraft([])}
            data-umami-event="materials-files-type-reset"
          >
            {t('files.reset')}
          </Button>
          <Button
            type="button"
            variant="primary"
            className="text-s-base h-auto rounded-lg px-4 py-2 font-medium"
            onClick={() => {
              onChange(draft);
              setOpen(false);
            }}
            data-umami-event="materials-files-type-apply"
          >
            {t('files.apply')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
