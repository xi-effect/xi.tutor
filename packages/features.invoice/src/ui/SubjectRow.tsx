import { Button } from '@xipkg/button';
import { FormControl, FormField, FormItem, useFieldArray, useFormContext } from '@xipkg/form';
import { Close } from '@xipkg/icons';
import { Input } from '@xipkg/input';

type SubjectRowProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  index: number;
};

export const SubjectRow = ({ control, index }: SubjectRowProps) => {
  console.log('SubjectRow');

  const { watch } = useFormContext();
  const items = watch('items');

  console.log('items', items);

  const item = items[index];

  const totalPrice = item.price * (item.quantity || 0);

  const { remove } = useFieldArray({
    control,
    name: 'items',
  });

  return (
    <div className="mb-4 grid grid-cols-[2fr_1fr_auto_1fr_auto_1fr_auto] items-center gap-2">
      <FormField
        control={control}
        name={`items.${index}.name`}
        defaultValue={0}
        render={({ field: formField }) => (
          <FormItem>
            <FormControl>
              <Input
                {...formField}
                placeholder="Название"
                variant="s"
                onChange={(e) => {
                  formField.onChange(e.target.value);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`items.${index}.price`}
        defaultValue={0}
        render={({ field: formField }) => (
          <FormItem>
            <FormControl>
              <Input
                {...formField}
                type="number"
                placeholder="Стоимость"
                min={0}
                variant="s"
                after={<span className="text-gray-60">₽</span>}
                onChange={(e) => {
                  const value = +e.target.value || 0;
                  formField.onChange(value);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <span className="text-gray-60">x</span>

      <FormField
        control={control}
        name={`items.${index}.quantity`}
        defaultValue={0}
        render={({ field: formField }) => (
          <FormItem>
            <FormControl>
              <Input
                {...formField}
                type="number"
                placeholder="Количество"
                min={1}
                variant="s"
                onChange={(e) => {
                  const value = +e.target.value || 0;
                  formField.onChange(value);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <span className="text-gray-60">=</span>

      <FormItem>
        <FormControl>
          <Input
            type="number"
            value={totalPrice}
            placeholder="Сумма"
            variant="s"
            after={<span className="text-gray-60">₽</span>}
            readOnly
          />
        </FormControl>
      </FormItem>
      <Button className="ml-2 h-[24px] w-[24px] p-0" variant="ghost" onClick={() => remove(index)}>
        <Close size="s" className="fill-gray-40" />
      </Button>
    </div>
  );
};
