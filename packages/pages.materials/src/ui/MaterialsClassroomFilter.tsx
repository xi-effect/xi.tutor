import { useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { ChevronSmallBottom } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { getClassroomDisplayName } from 'common.api';
import { useAllTutorClassrooms } from '../hooks';
import { MaterialsFilterOption } from './MaterialsFilterOption';

type MaterialsClassroomFilterProps = {
  value: number[];
  onChange: (classroomIds: number[]) => void;
};

const MAX_CHIP_NAMES = 2;

export const MaterialsClassroomFilter = ({ value, onChange }: MaterialsClassroomFilterProps) => {
  const { t } = useTranslation('materials');
  const [open, setOpen] = useState(false);
  const { classrooms, isLoading } = useAllTutorClassrooms(true);

  const selectedNames = useMemo(
    () =>
      classrooms
        .filter((classroom) => value.includes(classroom.id))
        .map((classroom) => getClassroomDisplayName(classroom))
        .filter(Boolean),
    [classrooms, value],
  );

  const chipValue =
    selectedNames.length === 0
      ? t('scope.classroomChipAll')
      : selectedNames.length <= MAX_CHIP_NAMES
        ? selectedNames.join(', ')
        : t('scope.classroomPicked', { count: selectedNames.length });

  const isAllSelected = value.length === 0;

  const handleSelectAll = () => {
    onChange([]);
  };

  const handleToggleClassroom = (classroomId: number) => {
    if (value.length === 0) {
      onChange([classroomId]);
      return;
    }

    const next = value.includes(classroomId)
      ? value.filter((id) => id !== classroomId)
      : [...value, classroomId].sort((a, b) => a - b);

    onChange(next);
  };

  return (
    <div className="inline-flex w-fit max-w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'box-border flex h-[33px] w-fit max-w-full shrink-0 items-center gap-2 rounded-full border py-2 pr-3 pl-4',
              'bg-status-info-background border-border-focus text-s-base text-text-primary font-medium',
              'outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
            )}
            data-umami-event="materials-classroom-filter"
            data-umami-event-classroom={value.join(',')}
          >
            <span className="max-w-[280px] truncate whitespace-nowrap">
              {t('scope.classroomChip', { value: chipValue })}
            </span>
            <ChevronSmallBottom
              className={cn(
                'fill-icon-secondary size-4 shrink-0 transition-transform',
                open && 'rotate-180',
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          className="border-border-default bg-background-surface w-[min(320px,calc(100vw-32px))] rounded-2xl border p-4 shadow-[0px_4px_16px_rgba(0,0,0,0.08)]"
        >
          <MaterialsFilterOption
            selected={isAllSelected}
            onSelect={handleSelectAll}
            umamiEvent="materials-classroom-filter-option"
            umamiScope="all"
          >
            {t('scope.classroomAll')}
          </MaterialsFilterOption>

          <div className="border-border-default mt-3 flex max-h-[min(280px,50vh)] w-full flex-col items-stretch gap-3 overflow-y-auto border-t bg-transparent pt-3">
            {isLoading ? (
              <p className="text-s-base text-text-secondary py-3">{t('scope.classroomLoading')}</p>
            ) : classrooms.length === 0 ? (
              <p className="text-s-base text-text-secondary py-3">{t('scope.classroomEmpty')}</p>
            ) : (
              classrooms.map((classroom) => {
                const name = getClassroomDisplayName(classroom) || t('scope.unnamedClassroom');

                return (
                  <MaterialsFilterOption
                    key={classroom.id}
                    variant="checkbox"
                    selected={!isAllSelected && value.includes(classroom.id)}
                    onSelect={() => handleToggleClassroom(classroom.id)}
                    umamiEvent="materials-classroom-filter-option"
                    umamiScope={String(classroom.id)}
                  >
                    {name}
                  </MaterialsFilterOption>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
