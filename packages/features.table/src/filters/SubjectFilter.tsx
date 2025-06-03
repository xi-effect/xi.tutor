import { Checkbox } from '@xipkg/checkbox';
import { Column } from '@tanstack/react-table';

interface ColumnProps<TData> {
  column: Column<TData, unknown>;
}

interface Subject {
  id: number;
  name: string;
}

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
