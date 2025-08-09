import { FormControl, FormField, FormItem, FormLabel } from '@xipkg/form';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@xipkg/select';
import { students } from '../../../mocks';

type StudentSelectorProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
};

export const StudentSelector = ({ control }: StudentSelectorProps) => {
  return (
    <FormField
      control={control}
      name="studentId"
      defaultValue=""
      render={({ field }) => (
        <FormItem>
          <FormLabel>Ученик или группа</FormLabel>
          <FormControl>
            <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
              <SelectTrigger className="mt-2 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-full">
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
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
