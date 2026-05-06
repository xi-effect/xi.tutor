import { Badge } from '@xipkg/badge';
import { cn } from '@xipkg/utils';

import { StatusEducationT, TypeEducationT } from '../types';
import { educationUtils } from 'common.entities';
import { useCurrentUser } from 'common.services';

type StatusBadgePropsT = {
  status: StatusEducationT;
  kind: TypeEducationT;
  deleted?: boolean;
};

const styles =
  'min-w-0 max-w-full rounded-lg border-none px-2 py-1 font-medium text-s-base sm:shrink-0 max-sm:flex max-sm:w-full max-sm:items-center max-sm:justify-center';

const mapStyles: Record<StatusEducationT, string> = {
  active: 'text-green-80 bg-green-0',
  paused: 'text-orange-80 bg-orange-0',
  locked: 'text-red-80 bg-red-0',
  finished: 'text-gray-80 bg-gray-5',
};

export const StatusBadge = ({ status, deleted }: StatusBadgePropsT) => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const baseClasses = deleted ? 'text-gray-80 bg-gray-5' : mapStyles[status];
  const statusText = educationUtils.getStatusTextByRole(status, isTutor);

  return (
    <Badge size="m" className={cn(styles, baseClasses)}>
      <span className="max-w-full min-w-0 truncate text-center">{statusText}</span>
    </Badge>
  );
};
