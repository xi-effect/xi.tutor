import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@xipkg/select';
import type { ClassroomT } from 'common.api';

type StudentSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  classrooms: ClassroomT[];
  isLoading?: boolean;
};

export const StudentSelector = ({
  value,
  onChange,
  classrooms,
  isLoading,
}: StudentSelectorProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="mt-1 mb-0 w-full" size="s">
        <SelectValue placeholder={isLoading ? 'Загрузка...' : 'Выберите'} />
      </SelectTrigger>
      <SelectContent className="w-full">
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
