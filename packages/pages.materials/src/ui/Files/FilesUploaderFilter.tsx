import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@xipkg/dropdown';
import { useTranslation } from 'react-i18next';
import { MaterialsFilterOption } from '../MaterialsFilterOption';
import { FilesFilterChip } from './FilesFilterChip';
import type { FilesUploaderFilterT } from '../../types';

const UPLOADER_OPTIONS: FilesUploaderFilterT[] = ['mine', 'students', 'all'];

type FilesUploaderFilterProps = {
  value: FilesUploaderFilterT;
  onChange: (value: FilesUploaderFilterT) => void;
};

export const FilesUploaderFilter = ({ value, onChange }: FilesUploaderFilterProps) => {
  const { t } = useTranslation('materials');
  const [open, setOpen] = useState(false);

  const chipValue = value === 'mine' ? t('files.uploader.mineShort') : t(`files.uploader.${value}`);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <FilesFilterChip
          open={open}
          selected={value !== 'mine'}
          umamiEvent="materials-files-uploader-filter"
        >
          {t('files.uploader.chip', { value: chipValue })}
        </FilesFilterChip>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="border-border-default !bg-background-surface w-72 rounded-2xl border p-4 shadow-[0px_4px_16px_rgba(0,0,0,0.08)]"
      >
        <div className="flex w-full flex-col items-stretch gap-2.5 bg-transparent">
          {UPLOADER_OPTIONS.map((option) => (
            <MaterialsFilterOption
              key={option}
              selected={value === option}
              onSelect={() => {
                onChange(option);
                setOpen(false);
              }}
              umamiEvent="materials-files-uploader-option"
              umamiScope={option}
            >
              {t(`files.uploader.${option}`)}
            </MaterialsFilterOption>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
