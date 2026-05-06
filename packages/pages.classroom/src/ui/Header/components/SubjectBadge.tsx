import { Badge } from '@xipkg/badge';

import { useSubjectsById } from 'common.services';

type SubjectBadgePropsT = {
  subject_id: number;
};

export const SubjectBadge = ({ subject_id }: SubjectBadgePropsT) => {
  const { data: subject } = useSubjectsById(subject_id);

  return (
    <Badge
      size="m"
      className="text-gray-60 bg-gray-10 text-s-base max-w-full min-w-0 rounded-lg border-none px-2 py-1 font-medium max-sm:flex max-sm:w-full max-sm:items-center max-sm:justify-center"
    >
      <span className="max-w-full min-w-0 truncate text-center">{subject?.name}</span>
    </Badge>
  );
};
