import { Button } from '@xipkg/button';
import { cn } from '@xipkg/utils';
import { ModalStudentsList } from 'features.students.list';

type LinkListStudentsT = {
  src: string;
  className?: string;
};

export const LinkListStudents = ({ className }: LinkListStudentsT) => {
  return (
    <ModalStudentsList>
      <Button
        size="s"
        variant="ghost"
        className={cn('rounded-lg px-4 py-2 font-medium text-gray-100', className)}
      >
        Список учеников
      </Button>
    </ModalStudentsList>
  );
};
