import { FormControl, FormField, FormItem, FormMessage } from '@xipkg/form';
import { Input } from '@xipkg/input';

type InvoiceSummaryProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  totalPrice: number;
};

export const InvoiceSummary = ({ control, totalPrice }: InvoiceSummaryProps) => {
  return (
    <div className="grid grid-cols-[2fr_1fr_auto_1fr_auto_1fr] items-center gap-4">
      <div />
      <span className="text-right">Итого:</span>
      <div />
      <span>1</span>
      <div />
      <FormField
        control={control}
        name="invoicePrice"
        defaultValue={0}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                {...field}
                type="number"
                placeholder="Стоимость"
                variant="s"
                after={<span>₽</span>}
                value={totalPrice}
                readOnly
                className="border-none p-0 text-right outline-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
