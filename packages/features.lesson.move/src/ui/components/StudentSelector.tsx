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
        className="border-gray-10 m-0 w-full rounded-lg border"
        size="s"
        before={before}
      >
        <SelectValue placeholder={isLoading ? 'Загрузка...' : 'Ученик или группа'} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] w-full">
        {classrooms.map((classroom) => (
          <SelectItem
            key={classroom.id}
            value={classroom.id.toString()}
            className="dark:text-gray-100"
          >
            {classroom.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
