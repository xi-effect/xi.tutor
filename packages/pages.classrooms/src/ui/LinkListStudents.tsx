import { Button } from '@xipkg/button';
import { ModalStudentsList } from './ModalStudentsList';

type LinkListStudentsT = {
  src: string;
  className?: string;
};

export const LinkListStudents = ({ className }: LinkListStudentsT) => {
  return (
    <ModalStudentsList>
      <Button variant="ghost" className={`text-m-base text-gray-80 font-normal ${className || ''}`}>
        Список учеников
      </Button>
    </ModalStudentsList>
  );
};
