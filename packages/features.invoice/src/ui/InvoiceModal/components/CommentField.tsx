import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@xipkg/form';
import { Input } from '@xipkg/input';

type CommentFieldProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
};

export const CommentField = ({ control }: CommentFieldProps) => {
  return (
    <FormField
      control={control}
      name="comment"
      defaultValue=""
      render={({ field: formField }) => (
        <FormItem className="pb-6">
          <FormLabel className="text-gray-100">
            Комментарий <span className="text-gray-60">не обязательно</span>
          </FormLabel>
          <FormControl>
            <Input {...formField} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
