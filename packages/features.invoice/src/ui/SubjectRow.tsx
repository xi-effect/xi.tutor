import { Button } from '@xipkg/button';
import { FormControl, FormField, FormItem, useFormContext } from '@xipkg/form';
import { Close } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { useTranslation } from 'react-i18next';
import { roundMoney } from '../model';

type SubjectRowPropsT = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  index: number;
  onRemove: () => void;
};

export const SubjectRow = ({ control, index, onRemove }: SubjectRowPropsT) => {
  const { t } = useTranslation('invoice');
  const { watch } = useFormContext();
  const items = watch('items');

  const item = items[index];

  const totalPrice = roundMoney(item.price * (item.quantity || 0));

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
                placeholder={t('placeholders.name')}
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
                placeholder={t('placeholders.price')}
                min={0}
                step={0.01}
                variant="s"
                after={<span className="text-text-secondary">₽</span>}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(',', '.');

                  if (rawValue === '') {
                    formField.onChange('');
                    return;
                  }

                  if (!/^\d*(\.\d{0,2})?$/.test(rawValue)) {
                    return;
                  }

                  const numValue = Number(rawValue);

                  if (isNaN(numValue)) {
                    return;
                  }

                  formField.onChange(numValue);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <span className="text-text-secondary">x</span>

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
                placeholder={t('placeholders.quantity')}
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

      <span className="text-text-secondary">=</span>

      <FormItem>
        <FormControl>
          <Input
            className="pointer-events-none"
            type="number"
            value={totalPrice}
            placeholder={t('placeholders.sum')}
            variant="s"
            after={<span className="text-text-secondary">₽</span>}
            readOnly
          />
        </FormControl>
      </FormItem>
      <Button
        type="button"
        className="ml-2 h-[24px] w-[24px] p-0"
        variant="none"
        onClick={onRemove}
      >
        <Close size="s" className="fill-icon-disabled h-6 w-6" />
      </Button>
    </div>
  );
};
