import { FormControl, FormField, FormItem, FormMessage } from '@xipkg/form';
import { Input } from '@xipkg/input';

type InvoiceSummaryProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  totalPrice: number;
};

export const InvoiceSummary = ({ control, totalPrice }: InvoiceSummaryProps) => {
  return (
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
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
