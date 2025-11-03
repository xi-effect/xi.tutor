import { FormControl, FormField, FormItem, FormLabel } from '@xipkg/form';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@xipkg/select';
import { useFetchClassrooms } from 'common.services';

type ClassroomSelectorProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
};

export const ClassroomSelector = ({ control }: ClassroomSelectorProps) => {
  const { data: classrooms, isLoading } = useFetchClassrooms();

  return (
    <FormField
      control={control}
      name="classroomId"
      defaultValue=""
      render={({ field }) => (
        <FormItem>
          <FormLabel>Кабинет</FormLabel>
          <FormControl>
            <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
              <SelectTrigger className="mt-1 mb-0 w-full">
                <SelectValue placeholder={isLoading ? 'Загрузка...' : 'Выберите кабинет'} />
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
          </FormControl>
        </FormItem>
      )}
    />
  );
};
