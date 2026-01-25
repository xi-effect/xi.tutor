import { Badge } from '@xipkg/badge';
import { cn } from '@xipkg/utils';
import { cva } from 'class-variance-authority';
import { StatusEducationT, TypeEducationT } from '../../../types';
import { educationUtils } from 'common.entities';
import { useCurrentUser } from 'common.services';

type StatusBadgePropsT = {
  status: StatusEducationT;
  kind?: TypeEducationT;
  deleted?: boolean;
  className?: string;
};

const badgeClasses = cva('rounded-lg border-none px-2 py-1 shrink-0', {
  variants: {
    status: {
      active: 'text-green-80 bg-green-0',
      paused: 'text-orange-80 bg-orange-0',
      locked: 'text-red-80 bg-red-0',
      finished: 'text-gray-80 bg-gray-5',
      deleted: 'text-gray-80 bg-gray-5',
    },
  },
  defaultVariants: {
    status: 'finished',
  },
});

const statusVariantMap = {
  active: 'success',
  paused: 'destructive',
  locked: 'destructive',
  finished: 'default',
  deleted: 'default',
};

export const StatusBadge = ({ status, deleted, className }: StatusBadgePropsT) => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const statusText = educationUtils.getStatusTextByRole(status, isTutor);

  const statusKey = deleted ? 'deleted' : status;
  const badgeClassName = cn(badgeClasses({ status: statusKey }), className);

  return (
    <Badge size="m" variant={statusVariantMap[statusKey]} className={badgeClassName}>
      {statusText}
    </Badge>
  );
};
