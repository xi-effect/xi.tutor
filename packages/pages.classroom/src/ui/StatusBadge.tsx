import { Badge } from '@xipkg/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { cn } from '@xipkg/utils';
import { educationStatusBadgeClasses, getEducationStatusLabel } from 'common.ui';

import { StatusEducationT, TypeEducationT } from '../types';
import { useCurrentUser } from 'common.services';
import { useTranslation } from 'react-i18next';

type StatusBadgePropsT = {
  status: StatusEducationT;
  kind: TypeEducationT;
  deleted?: boolean;
};

const styles = 'min-w-0 shrink-0 rounded-lg border-none px-2 py-1 font-medium text-s-base';

export const StatusBadge = ({ status, deleted }: StatusBadgePropsT) => {
  const { t } = useTranslation('commonUi');
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const baseClasses = deleted
    ? educationStatusBadgeClasses.finished
    : educationStatusBadgeClasses[status];
  const statusText = getEducationStatusLabel(status, isTutor, t);

  const badge = (
    <Badge size="m" className={cn(styles, baseClasses)}>
      <span className="max-w-full min-w-0 truncate text-center">{statusText}</span>
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
