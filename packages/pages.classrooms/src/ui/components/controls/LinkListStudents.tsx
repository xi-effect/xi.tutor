import { Button } from '@xipkg/button';
import { ModalStudentsList } from 'features.students.list';

type LinkListStudentsT = {
  src: string;
  className?: string;
};

export const LinkListStudents = ({ className }: LinkListStudentsT) => {
  return (
    <ModalStudentsList>
      <Button size="s" variant="ghost" className={`text-m-base font-normal ${className || ''}`}>
        Список учеников
      </Button>
    </ModalStudentsList>
  );
};
