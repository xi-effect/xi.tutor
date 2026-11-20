import { Tooltip, TooltipTrigger } from '@xipkg/tooltip';
import { CardTooltipContent } from 'common.ui';
import { useSubjectsById } from 'common.services';

type SubjectLabelProps = {
  subjectId: number;
};

export const SubjectLabel = ({ subjectId }: SubjectLabelProps) => {
  const { data: subject } = useSubjectsById(subjectId);
  const name = subject?.name;

  if (!name) return null;

  return (
    <Tooltip delayDuration={1000}>
      <TooltipTrigger asChild>
        <span className="text-text-secondary block w-full truncate text-xs leading-4 font-normal">
          {name}
        </span>
      </TooltipTrigger>
      <CardTooltipContent>{name}</CardTooltipContent>
    </Tooltip>
  );
};
