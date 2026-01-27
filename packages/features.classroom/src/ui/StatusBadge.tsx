import { Badge } from '@xipkg/badge';
import { cn } from '@xipkg/utils';
import { educationUtils, StatusEducationT, TypeEducationT } from 'common.entities';
import { useCurrentUser } from 'common.services';

type StatusBadgePropsT = {
  status: StatusEducationT;
  kind?: TypeEducationT;
  deleted?: boolean;
  className?: string;
  textClassName?: string;
};

const baseClassName = 'rounded-lg border-none px-2 py-1 font-medium text-s-base shrink-0';

const mapStyles: Record<StatusEducationT, string> = {
  active: 'text-green-80 bg-green-0',
  paused: 'text-orange-80 bg-orange-0',
  locked: 'text-red-80 bg-red-0',
  finished: 'text-gray-80 bg-gray-5',
};

export const StatusBadge = ({ status, deleted, className, textClassName }: StatusBadgePropsT) => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const statusText = educationUtils.getStatusTextByRole(status, isTutor);

  const statusClassName = deleted ? mapStyles.finished : mapStyles[status];

  return (
    <Badge size="m" className={cn(baseClassName, statusClassName, className)}>
      <span className={textClassName}>{statusText}</span>
    </Badge>
  );
};
