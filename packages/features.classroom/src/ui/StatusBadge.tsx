import { Badge } from '@xipkg/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { cn } from '@xipkg/utils';
import { educationStatusBadgeClasses, getEducationStatusLabel } from 'common.ui';
import { StatusEducationT, TypeEducationT } from 'common.entities';
import { useCurrentUser } from 'common.services';
import { useTranslation } from 'react-i18next';

type StatusBadgePropsT = {
  status: StatusEducationT;
  kind?: TypeEducationT;
  deleted?: boolean;
  className?: string;
  textClassName?: string;
};

const baseClassName = 'rounded-lg border-none px-2 py-1 font-medium text-s-base shrink-0';

export const StatusBadge = ({ status, deleted, className, textClassName }: StatusBadgePropsT) => {
  const { t } = useTranslation('commonUi');
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const statusText = getEducationStatusLabel(status, isTutor, t);

  const statusClassName = deleted
    ? educationStatusBadgeClasses.finished
    : educationStatusBadgeClasses[status];

  const badge = (
    <Badge size="m" className={cn(baseClassName, statusClassName, className)}>
      <span className={textClassName}>{statusText}</span>
    </Badge>
  );

  if (status !== 'locked') {
    return badge;
  }

  const role = isTutor ? 'tutor' : 'student';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex min-w-0">{badge}</span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="z-[200] max-w-72 leading-5 font-normal">
        {t(`educationStatus.${role}.lockedHint`)}
      </TooltipContent>
    </Tooltip>
  );
};
