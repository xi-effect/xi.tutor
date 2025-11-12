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
      defaultValue={null}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel className="text-gray-100">
            Комментарий для ученика{' '}
            <span className="text-gray-60 text-xs-base">не обязательно</span>
          </FormLabel>
          <FormControl className="my-2">
            <Input placeholder="например, оплата занятий за сентябрь" {...formField} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
