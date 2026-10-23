import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { cn } from '@xipkg/utils';
import { CLASSROOM_STATUSES, type ClassroomStatusT } from 'common.api';
import { useTranslation } from 'react-i18next';
import { ClassroomsFilterOption } from './ClassroomsFilterOption';
import { ClassroomsFilterChip } from './ClassroomsFilterChip';
import { ClassroomsFilterActions } from './ClassroomsFilterActions';

const classroomsFilterPopoverClass = cn(
  'bg-background-surface text-text-primary z-50 flex w-[280px] min-w-0 max-w-[280px] flex-col gap-4 overflow-hidden rounded-2xl border border-border-default p-4 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] outline-none',
);

type ClassroomsStatusFilterProps = {
  value: ClassroomStatusT[];
  onChange: (statuses: ClassroomStatusT[]) => void;
};

export const ClassroomsStatusFilter = ({ value, onChange }: ClassroomsStatusFilterProps) => {
  const { t } = useTranslation('classrooms');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ClassroomStatusT[]>(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
    }
  }, [open, value]);

  const toggleStatus = (status: ClassroomStatusT) => {
    setDraft((current) =>
      current.includes(status) ? current.filter((item) => item !== status) : [...current, status],
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ClassroomsFilterChip
          open={open}
          selected={value.length > 0}
          umamiEvent="classrooms-status-filter"
        >
          {value.length > 0
            ? t('filters.statusChipCount', { count: value.length })
            : t('filters.statusChip')}
        </ClassroomsFilterChip>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className={classroomsFilterPopoverClass}>
        <div className="flex w-full flex-col items-stretch gap-3 bg-transparent">
          {CLASSROOM_STATUSES.map((status) => (
            <ClassroomsFilterOption
              key={status}
              selected={draft.includes(status)}
              onSelect={() => toggleStatus(status)}
              umamiEvent="classrooms-status-filter-option"
              umamiScope={status}
            >
              {t(`status.${status}`)}
            </ClassroomsFilterOption>
          ))}
        </div>
        <ClassroomsFilterActions
          canReset={draft.length > 0}
          onReset={() => setDraft([])}
          onApply={() => {
            onChange(draft);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
