import { useEffect, useState } from 'react';
import { Input } from '@xipkg/input';
import { Checkbox } from '@xipkg/checkbox';
import { Column, Table } from '@tanstack/react-table';

interface ColumnProps<TData> {
  column: Column<TData, unknown>;
}

interface TableProps<TData> {
  table: Table<TData>;
}

interface Student {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
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

export const StudentFilter = <TData,>({
  table,
  students,
}: TableProps<TData> & { students: Student[] }) => {
  const column = table.getColumn('idStudent');
  const selected = (column?.getFilterValue() as number[]) || [];

  const toggleValue = (id: number) => {
    const next = selected.includes(id)
      ? selected.filter((v: number) => v !== id)
      : [...selected, id];
    column?.setFilterValue(next.length ? next : undefined);
  };

  return (
    <div className="max-h-40 space-y-2 overflow-auto">
      {students.map((student: Student) => (
        <div key={student.id} className="flex items-center gap-2">
          <Checkbox
            checked={selected.includes(student.id)}
            onCheckedChange={() => toggleValue(student.id)}
          />
          <span>{student.name}</span>
        </div>
      ))}
    </div>
  );
};

export const SubjectFilter = <TData,>({
  column,
  subjects,
}: ColumnProps<TData> & { subjects: Subject[] }) => {
  const selected = (column?.getFilterValue() as number[]) || [];

  const toggleValue = (id: number) => {
    const next = selected.includes(id)
      ? selected.filter((v: number) => v !== id)
      : [...selected, id];
    column.setFilterValue(next.length ? next : undefined);
  };

  return (
    <div className="max-h-40 space-y-2 overflow-auto">
      {subjects.map((subject: Subject) => (
        <div key={subject.id} className="flex items-center gap-2">
          <Checkbox
            checked={selected.includes(subject.id)}
            onCheckedChange={() => toggleValue(subject.id)}
          />
          <span>{subject.name}</span>
        </div>
      ))}
    </div>
  );
};

export const CheckboxFilter = <TData,>({
  column,
  options,
}: ColumnProps<TData> & { options: string[] }) => {
  const selected = (column.getFilterValue() as string[]) || [];

  const toggleValue = (val: string) => {
    const next = selected.includes(val)
      ? selected.filter((v: string) => v !== val)
      : [...selected, val];
    column.setFilterValue(next.length ? next : undefined);
  };

  return (
    <div className="max-h-40 space-y-2 overflow-auto">
      {options.map((option: string) => (
        <div key={option} className="flex items-center gap-2">
          <Checkbox
            checked={selected.includes(option)}
            onCheckedChange={() => toggleValue(option)}
          />
          <span>{option}</span>
        </div>
      ))}
    </div>
  );
};
