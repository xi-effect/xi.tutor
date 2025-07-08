import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@xipkg/form';
import { InputWithHelper } from '../../InputWithHelper/InputWithHelper';

type SubjectSelectorProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  values: string[];
  suggestions: string[];
  onRemoveItem: (name: string) => void;
  onSelectItem: (name: string) => void;
};

export const SubjectSelector = ({
  control,
  values,
  suggestions,
  onRemoveItem,
  onSelectItem,
}: SubjectSelectorProps) => {
  return (
    <FormField
      control={control}
      name="subjects"
      defaultValue={[]}
      render={() => (
        <FormItem className="pb-6">
          <FormLabel>Предметы</FormLabel>
          <FormControl>
            <InputWithHelper
              values={values}
              onRemoveItem={onRemoveItem}
              onSelectItem={onSelectItem}
              suggestions={suggestions}
              className="mt-2"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
