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
        variant="ghost"
        className={cn(
          'text-text-primary !h-auto rounded-[10px] px-5 py-3 text-base leading-5 font-medium',
          className,
        )}
      >
        Список учеников
      </Button>
    </ModalStudentsList>
  );
};
