import { Badge } from '@xipkg/badge';
import { cn } from '@xipkg/utils';
import { categoryBadgeClass } from 'common.ui';
import { useSubjectsById } from 'common.services';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';

type SubjectBadgePropsT = {
  subjectId: number;
  className?: string;
  textClassName?: string;
  isTooltip?: boolean;
  size?: 's' | 'm';
};

export const SubjectBadge = ({
  subjectId,
  size = 'm',
  className,
  textClassName,
  isTooltip = false,
}: SubjectBadgePropsT) => {
  const { data: subject } = useSubjectsById(subjectId);

  const badgeContent = (
    <Badge size={size} className={cn(categoryBadgeClass, className)}>
      <span className={textClassName}>{subject?.name}</span>
    </Badge>
  );

  if (!isTooltip) return badgeContent;

  return (
    <Tooltip delayDuration={1000}>
      <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
      <TooltipContent>{subject?.name}</TooltipContent>
    </Tooltip>
  );
};
