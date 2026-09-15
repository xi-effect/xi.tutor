import { getClassroomDisplayName, isClassroomOnPause } from 'common.api';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@xipkg/form';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@xipkg/select';
import { useFetchClassrooms } from 'common.services';
import { useTranslation } from 'react-i18next';

type ClassroomSelectorProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
};

export const ClassroomSelector = ({ control }: ClassroomSelectorProps) => {
  const { t } = useTranslation('invoice');
  const { data: classrooms, isLoading } = useFetchClassrooms();

  const selectableClassrooms =
    classrooms?.filter((classroom) => !isClassroomOnPause(classroom.status)) ?? [];
  const isDisabled = selectableClassrooms.length === 0;

  const getPlaceholder = () => {
    if (isLoading) return t('classroom.loading');
    if (isDisabled) return t('classroom.notFound');
    return t('classroom.placeholder');
  };

  return (
    <FormField
      control={control}
      name="classroomId"
      defaultValue=""
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-text-primary">{t('classroom.label')}</FormLabel>
          <FormControl>
            <Select
              disabled={isLoading || isDisabled}
              value={field.value}
              onValueChange={(value) => field.onChange(value)}
            >
              <SelectTrigger className="text-text-primary mt-1 mb-0 w-full">
                <SelectValue
                  placeholder={getPlaceholder()}
                  className="data-placeholder:text-text-disabled text-text-primary"
                />
              </SelectTrigger>
              <SelectContent className="max-h-[min(300px,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)] overflow-y-auto">
                {selectableClassrooms.map((classroom) => (
                  <SelectItem
                    key={classroom.id}
                    value={classroom.id.toString()}
                    className="text-text-primary"
                  >
                    {getClassroomDisplayName(classroom)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
