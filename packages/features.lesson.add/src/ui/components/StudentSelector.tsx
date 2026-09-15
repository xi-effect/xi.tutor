import type { ReactNode } from 'react';
import { Portal as TooltipPortal } from '@radix-ui/react-tooltip';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@xipkg/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { useTranslation } from 'react-i18next';
import { getClassroomDisplayName, type ClassroomT, isClassroomOnPause } from 'common.api';

type StudentSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  classrooms: ClassroomT[];
  isLoading?: boolean;
  before?: ReactNode;
};

export const StudentSelector = ({
  value,
  onChange,
  classrooms,
  isLoading,
  before,
}: StudentSelectorProps) => {
  const { t } = useTranslation('lessonAdd');
  const selectableClassrooms = classrooms.filter(
    (classroom) => !isClassroomOnPause(classroom.status),
  );
  const isEmpty = !isLoading && selectableClassrooms.length === 0;

  const placeholder = isLoading
    ? t('studentSelector.loading')
    : isEmpty
      ? t('studentSelector.empty')
      : t('studentSelector.placeholder');

  const selector = (
    <Select value={value} onValueChange={onChange} disabled={isEmpty}>
      <SelectTrigger
        className="border-border-default text-text-primary m-0 w-full rounded-lg border"
        size="s"
        before={before}
        disabled={isEmpty}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[min(300px,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)] overflow-y-auto">
        {selectableClassrooms.map((classroom) => (
          <SelectItem
            key={classroom.id}
            value={classroom.id.toString()}
            className="dark:text-text-primary max-w-full min-w-0 truncate"
          >
            {getClassroomDisplayName(classroom)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (!isEmpty) {
    return selector;
  }

  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <span className="block w-full">{selector}</span>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent side="top" className="max-w-[280px]">
          {t('studentSelector.emptyTooltip')}
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  );
};
