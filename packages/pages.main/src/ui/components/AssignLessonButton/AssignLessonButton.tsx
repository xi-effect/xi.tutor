import { useCurrentUser } from 'common.services';
import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';
import { cn } from '@xipkg/utils';

export const AssignLessonButton = ({ className }: { className?: string }) => {
  const { data: user } = useCurrentUser();

  const isTutor = user.default_layout === 'tutor';
  return (
    <>
      {isTutor && (
        <div className={cn('ml-auto flex justify-end', className)}>
          <Button size="s" className="text-s-base text-brand-0 hidden rounded-lg px-4 sm:flex">
            Назначить занятие
          </Button>
          <Button
            size="s"
            className="text-s-base text-brand-0 z-50 flex w-8 rounded-lg p-0 sm:hidden"
          >
            <Plus className="fill-brand-0" />
          </Button>
        </div>
      )}
    </>
  );
};
