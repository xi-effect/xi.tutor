import { FormControl, FormField, FormItem, FormMessage } from '@xipkg/form';
import { Input } from '@xipkg/input';
import { useDebouncedFunction } from '@xipkg/utils';
import type { SubjectT } from '../../../types/InvoiceTypes';

type SubjectRowProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  index: number;
  subject: SubjectT;
  onSubjectChange: (index: number, field: keyof SubjectT, value: number) => void;
};

export const SubjectRow = ({ control, index, subject, onSubjectChange }: SubjectRowProps) => {
  const totalPrice = subject.pricePerLesson * (subject.unpaidLessonsAmount || 0);

  const debouncedPriceChange = useDebouncedFunction(
    (...args: unknown[]) => onSubjectChange(index, 'pricePerLesson', args[0] as number),
    500,
  );

  const debouncedAmountChange = useDebouncedFunction(
    (...args: unknown[]) => onSubjectChange(index, 'unpaidLessonsAmount', args[0] as number),
    500,
  );

  return (
    <div className="mb-4 grid grid-cols-[2fr_1fr_auto_1fr_auto_1fr] items-center">
      <div>
        <p>{subject.variant}</p>
        <p className="text-gray-60 text-sm">
          {`Неоплаченных: ${subject.unpaidLessonsAmount || 0}`}
        </p>
      </div>

      <FormField
        control={control}
        name={`subjects.${index}.pricePerLesson`}
        defaultValue={0}
        render={({ field: formField }) => (
          <FormItem>
            <FormControl>
              <Input
                {...formField}
                type="number"
                placeholder="Стоимость"
                variant="s"
                after={<span>₽</span>}
                value={subject.pricePerLesson}
                onChange={(e) => {
                  const value = +e.target.value || 0;
                  formField.onChange(value);
                  debouncedPriceChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <span className="mx-2">x</span>

      <FormField
        control={control}
        name={`subjects.${index}.unpaidLessonsAmount`}
        defaultValue={0}
        render={({ field: formField }) => (
          <FormItem>
            <FormControl>
              <Input
                {...formField}
                type="number"
                placeholder="Раз"
                variant="s"
                value={subject.unpaidLessonsAmount || 0}
                onChange={(e) => {
                  const value = +e.target.value || 0;
                  formField.onChange(value);
                  debouncedAmountChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <span className="mx-2">=</span>

      <FormField
        control={control}
        name={`subjects.${index}.totalPrice`}
        defaultValue={0}
        render={({ field: formField }) => (
          <FormItem>
            <FormControl>
              <Input
                {...formField}
                type="number"
                value={totalPrice}
                placeholder="Сумма"
                variant="s"
                after={<span>₽</span>}
                readOnly
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
