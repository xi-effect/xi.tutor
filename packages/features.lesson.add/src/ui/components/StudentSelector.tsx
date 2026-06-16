import type { ReactNode } from 'react';
import { Portal as TooltipPortal } from '@radix-ui/react-tooltip';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@xipkg/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import type { ClassroomT } from 'common.api';

const EMPTY_CLASSROOMS_TOOLTIP =
  'У вас пока нет кабинетов. Создайте кабинет для групповых или индивидуальных занятий';

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
  const isEmpty = !isLoading && classrooms.length === 0;

  const placeholder = isLoading
    ? 'Загрузка...'
    : isEmpty
      ? 'Нет доступных кабинетов'
      : 'Ученик или группа';

  const selector = (
    <Select value={value} onValueChange={onChange} disabled={isEmpty}>
      <SelectTrigger
        className="border-gray-10 m-0 w-full rounded-lg border text-gray-100"
        size="s"
        before={before}
        disabled={isEmpty}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]">
        {classrooms.map((classroom) => (
          <SelectItem
            key={classroom.id}
            value={classroom.id.toString()}
            className="max-w-full min-w-0 truncate dark:text-gray-100"
          >
            {classroom.name}
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
          {EMPTY_CLASSROOMS_TOOLTIP}
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  );
};
