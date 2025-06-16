import { useEffect, useState } from 'react';
import { Input } from '@xipkg/input';
import { Column } from '@tanstack/react-table';

interface ColumnProps<TData> {
  column: Column<TData, unknown>;
}

export const DateRangeFilter = <TData,>({ column }: ColumnProps<TData>) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    column.setFilterValue(from && to ? [from, to] : undefined);
  }, [from, to, column]);

  return (
    <div className="space-y-2">
      <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
    </div>
  );
};
