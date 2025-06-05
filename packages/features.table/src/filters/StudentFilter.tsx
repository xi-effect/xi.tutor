import { Checkbox } from '@xipkg/checkbox';
import { Table } from '@tanstack/react-table';

interface TableProps<TData> {
  table: Table<TData>;
}

interface Student {
  id: number;
  name: string;
}

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
