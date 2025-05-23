import { Link } from '@xipkg/link';

type LinkListStudentsT = {
  src: string;
  className?: string;
};

export const LinkListStudents = ({ src, className }: LinkListStudentsT) => {
  return (
    <Link
      href={src}
      variant="hover"
      className={`text-m-base text-gray-80 font-normal ${className || ''}`}
    >
      Список учеников
    </Link>
  );
};
