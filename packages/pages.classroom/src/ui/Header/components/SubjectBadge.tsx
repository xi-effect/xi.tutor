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
      className="text-gray-60 bg-gray-10 text-s-base rounded-lg border-none px-2 py-1 font-medium"
    >
      {subject?.name}
    </Badge>
  );
};
