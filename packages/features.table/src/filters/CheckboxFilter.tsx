import { Checkbox } from '@xipkg/checkbox';
import { Column } from '@tanstack/react-table';

interface ColumnProps<TData> {
  column: Column<TData, unknown>;
}

type OptionT = {
  value: string;
  label: string;
};

export const CheckboxFilter = <TData,>({
  column,
  options,
}: ColumnProps<TData> & { options: OptionT[] }) => {
  const selected = (column.getFilterValue() as string[]) || [];

  const toggleValue = (val: string) => {
    const next = selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val];
    column.setFilterValue(next.length ? next : undefined);
  };

  const normalizedOptions: OptionT[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt,
  );

  return (
    <div className="max-h-40 space-y-2 overflow-auto">
      {normalizedOptions.map(({ value, label }) => (
        <div key={value} className="flex items-center gap-2">
          <Checkbox checked={selected.includes(value)} onCheckedChange={() => toggleValue(value)} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};
