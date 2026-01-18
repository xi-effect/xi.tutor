import { Badge } from '@xipkg/badge';
import { cn } from '@xipkg/utils';
import { useSubjectsById } from 'common.services';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';

type SubjectBadgePropsT = {
  subject_id: number;
  className?: string;
  textStyles?: string;
  isTooltip?: boolean;
};

export const SubjectBadge = ({
  subject_id,
  className,
  textStyles,
  isTooltip = false,
}: SubjectBadgePropsT) => {
  const { data: subject } = useSubjectsById(subject_id);

  const badgeContent = (
    <Badge
      size="m"
      className={cn('text-gray-80 bg-gray-5 rounded-lg border-none px-2 py-1', className)}
    >
      <span className={textStyles}>{subject?.name}</span>
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
