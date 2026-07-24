import { useEffect, useState } from 'react';
import { Input } from '@xipkg/input';
import { Column } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

interface ColumnProps<TData> {
  column: Column<TData, unknown>;
}

export const AmountRangeFilter = <TData,>({ column }: ColumnProps<TData>) => {
  const { t } = useTranslation('paymentsTable');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  useEffect(() => {
    column.setFilterValue(min || max ? [min, max] : undefined);
  }, [min, max, column]);

  return (
    <div className="space-y-2">
      <Input
        type="number"
        placeholder={t('filter.from')}
        value={min}
        onChange={(e) => setMin(e.target.value)}
      />
      <Input
        type="number"
        placeholder={t('filter.to')}
        value={max}
        onChange={(e) => setMax(e.target.value)}
      />
    </div>
  );
};
