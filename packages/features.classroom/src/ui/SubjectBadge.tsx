import { Badge } from '@xipkg/badge';
import { cn } from '@xipkg/utils';
import { useSubjectsById } from 'common.services';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';

type SubjectBadgePropsT = {
  subjectId: number;
  className?: string;
  textClassName?: string;
  isTooltip?: boolean;
};

export const SubjectBadge = ({
  subjectId,
  className,
  textClassName,
  isTooltip = false,
}: SubjectBadgePropsT) => {
  const { data: subject } = useSubjectsById(subjectId);

  const badgeContent = (
    <Badge
      size="m"
      className={cn('text-gray-80 bg-gray-5 rounded-lg border-none px-2 py-1', className)}
    >
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
