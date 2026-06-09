import { Badge } from '@xipkg/badge';
import { cn } from '@xipkg/utils';
import { categoryBadgeClass } from 'common.ui';

import { useSubjectsById } from 'common.services';

type SubjectBadgePropsT = {
  subject_id: number;
};

export const SubjectBadge = ({ subject_id }: SubjectBadgePropsT) => {
  const { data: subject } = useSubjectsById(subject_id);

  return (
    <Badge
      size="m"
      className={cn(
        categoryBadgeClass,
        'max-w-full min-w-0 max-sm:flex max-sm:w-full max-sm:items-center max-sm:justify-center',
      )}
    >
      <span className="max-w-full min-w-0 truncate text-center">{subject?.name}</span>
    </Badge>
  );
};
