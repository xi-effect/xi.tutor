import { Button } from '@xipkg/button';
import { FormControl, FormField, FormItem, useFieldArray, useFormContext } from '@xipkg/form';
import { Close } from '@xipkg/icons';
import { Input } from '@xipkg/input';

type SubjectRowPropsT = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  index: number;
};

const DEFAULT_VALUE = 0;
const MIN_VALUE = 1;

export const SubjectRowMobile = ({ control, index }: SubjectRowPropsT) => {
  const { watch } = useFormContext();
  const items = watch('items');

  const item = items[index];

  const totalPrice = item.price * (item.quantity || 0);

  const { remove } = useFieldArray({
    control,
    name: 'items',
  });

  return (
    <div className="mb-4 flex flex-col gap-2">
      <FormField
        control={control}
        name={`items.${index}.name`}
        defaultValue={DEFAULT_VALUE}
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

      <div className="flex items-center gap-2">
        <div className="min-w-[100px] flex-1">
          <FormField
            control={control}
            name={`items.${index}.price`}
            defaultValue={DEFAULT_VALUE}
            render={({ field: formField }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...formField}
                    type="number"
                    placeholder="Стоимость"
                    min={DEFAULT_VALUE}
                    variant="s"
                    after={<span className="text-gray-60">₽</span>}
                    onChange={(e) => {
                      const numValue = e.target.valueAsNumber;
                      const value = e.target.value === '' || isNaN(numValue) ? '' : numValue;
                      formField.onChange(value);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <span className="text-gray-60 shrink-0 text-sm">x</span>

        <div className="min-w-[50px] flex-1">
          <FormField
            control={control}
            name={`items.${index}.quantity`}
            defaultValue={DEFAULT_VALUE}
            render={({ field: formField }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...formField}
                    type="number"
                    placeholder="Кол-во"
                    min={MIN_VALUE}
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
        </div>

        <span className="text-gray-60 shrink-0 text-sm">=</span>

        <div className="min-w-[90px] flex-1">
          <FormItem>
            <FormControl>
              <Input
                className="pointer-events-none"
                type="number"
                value={totalPrice}
                placeholder="Сумма"
                variant="s"
                after={<span className="text-gray-60">₽</span>}
                readOnly
              />
            </FormControl>
          </FormItem>
        </div>
      </div>
      <Button className="ml-2 h-6 w-6 p-0" variant="ghost" onClick={() => remove(index)}>
        <Close size="s" className="fill-gray-40 h-6 w-6" />
      </Button>
    </div>
  );
};
