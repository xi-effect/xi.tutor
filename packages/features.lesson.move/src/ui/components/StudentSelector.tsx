import type { ReactNode } from 'react';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@xipkg/select';
import type { ClassroomT } from 'common.api';

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
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className="border-border-default text-text-primary m-0 w-full rounded-lg border"
        size="s"
        before={before}
      >
        <SelectValue placeholder={isLoading ? 'Загрузка...' : 'Ученик или группа'} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]">
        {classrooms.map((classroom) => (
          <SelectItem
            key={classroom.id}
            value={classroom.id.toString()}
            className="dark:text-text-primary max-w-full min-w-0 truncate"
          >
            {classroom.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
