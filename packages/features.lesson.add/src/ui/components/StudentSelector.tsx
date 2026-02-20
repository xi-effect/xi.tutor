import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@xipkg/select';
import { useFetchClassrooms } from 'common.services';

type StudentSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export const StudentSelector = ({ value, onChange }: StudentSelectorProps) => {
  const { data: classrooms, isLoading } = useFetchClassrooms();

  return (
    <Select value={value} onValueChange={(value) => onChange(value)}>
      <SelectTrigger className="mt-1 mb-0 w-full" size="s">
        <SelectValue placeholder={isLoading ? 'Загрузка...' : 'Выберите'} />
      </SelectTrigger>
      <SelectContent className="w-full">
        {classrooms?.map((classroom) => (
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
