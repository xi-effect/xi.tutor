import { useEffect, useState } from 'react';
import { Input } from '@xipkg/input';
import { Column } from '@tanstack/react-table';

interface ColumnProps<TData> {
  column: Column<TData, unknown>;
}

export const AmountRangeFilter = <TData,>({ column }: ColumnProps<TData>) => {
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  useEffect(() => {
    column.setFilterValue(min || max ? [min, max] : undefined);
  }, [min, max, column]);

  return (
    <div className="space-y-2">
      <Input type="number" placeholder="От" value={min} onChange={(e) => setMin(e.target.value)} />
      <Input type="number" placeholder="До" value={max} onChange={(e) => setMax(e.target.value)} />
    </div>
  );
};
