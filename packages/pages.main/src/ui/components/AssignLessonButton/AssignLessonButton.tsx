import { useCurrentUser } from 'common.services';
import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import type { FC } from 'react';

type AssignLessonButtonProps = {
  className?: string;
  onButtonClick?: () => void;
};

export const AssignLessonButton: FC<AssignLessonButtonProps> = ({ className, onButtonClick }) => {
  const { data: user } = useCurrentUser();

  const isTutor = user?.default_layout === 'tutor';

  return (
    <>
      {isTutor && (
        <div className={cn('ml-auto flex justify-end', className)}>
          <Button
            size="s"
            className="text-s-base text-text-on-accent hidden rounded-lg px-4 sm:flex"
            onClick={onButtonClick}
          >
            Назначить занятие
          </Button>
          <Button
            size="s"
            className="text-s-base text-text-on-accent z-50 flex w-8 rounded-lg p-0 sm:hidden"
            onClick={onButtonClick}
          >
            <Plus className="fill-action-primary-text" />
          </Button>
        </div>
      )}
    </>
  );
};
