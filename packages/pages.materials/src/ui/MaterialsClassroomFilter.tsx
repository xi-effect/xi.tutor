import { useMemo, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@xipkg/dropdown';
import { ChevronSmallBottom } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { getClassroomDisplayName } from 'common.api';
import { useFetchClassrooms } from 'common.services';
import { MaterialsFilterOption } from './MaterialsFilterOption';

type MaterialsClassroomFilterProps = {
  value: number | null;
  onChange: (classroomId: number | null) => void;
};

export const MaterialsClassroomFilter = ({ value, onChange }: MaterialsClassroomFilterProps) => {
  const { t } = useTranslation('materials');
  const [open, setOpen] = useState(false);
  const { data: classrooms } = useFetchClassrooms({ limit: 100 });

  const sortedClassrooms = useMemo(() => {
    if (!classrooms?.length) return [];

    return [...classrooms].sort((a, b) =>
      getClassroomDisplayName(a).localeCompare(getClassroomDisplayName(b), 'ru', {
        sensitivity: 'base',
      }),
    );
  }, [classrooms]);

  const selectedClassroomName = useMemo(() => {
    if (value == null) return null;
    const classroom = sortedClassrooms.find((item) => item.id === value);
    return classroom ? getClassroomDisplayName(classroom) : null;
  }, [sortedClassrooms, value]);

  const chipLabel = selectedClassroomName || t('scope.classroomAll');

  const handleSelect = (classroomId: number | null) => {
    onChange(classroomId);
    setOpen(false);
  };

  if (sortedClassrooms.length === 0) {
    return null;
  }

  return (
    <div className="inline-flex w-fit max-w-full">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'box-border flex h-[33px] w-fit max-w-full shrink-0 items-center gap-2 rounded-full border py-2 pr-3 pl-4',
              'bg-status-info-background border-border-focus text-s-base text-text-primary font-medium',
              'outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
            )}
            data-umami-event="materials-classroom-filter"
            data-umami-event-classroom={value ?? ''}
          >
            <span className="max-w-[220px] truncate whitespace-nowrap">{chipLabel}</span>
            <ChevronSmallBottom
              className={cn(
                'fill-icon-secondary size-4 shrink-0 transition-transform',
                open && 'rotate-180',
              )}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="border-border-default !bg-background-surface w-max max-w-[min(320px,calc(100vw-32px))] min-w-[220px] rounded-2xl border p-4 shadow-[0px_4px_16px_rgba(0,0,0,0.08)]"
        >
          <div className="flex max-h-[min(360px,70vh)] w-full flex-col items-stretch gap-4 overflow-y-auto bg-transparent">
            <MaterialsFilterOption
              selected={value == null}
              onSelect={() => handleSelect(null)}
              umamiEvent="materials-classroom-filter-option"
              umamiScope="all"
            >
              {t('scope.classroomAll')}
            </MaterialsFilterOption>
            {sortedClassrooms.map((classroom) => {
              const name = getClassroomDisplayName(classroom) || t('scope.unnamedClassroom');

              return (
                <MaterialsFilterOption
                  key={classroom.id}
                  selected={value === classroom.id}
                  onSelect={() => handleSelect(classroom.id)}
                  umamiEvent="materials-classroom-filter-option"
                  umamiScope={String(classroom.id)}
                >
                  {name}
                </MaterialsFilterOption>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
