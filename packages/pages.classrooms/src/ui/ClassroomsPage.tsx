import { DateTimeDisplay } from 'common.ui';
import { MobileTutorActionButton } from 'features.invites';
import { ButtonsHeader, LinkListStudents, CardsGridSimple } from './components';
import { useCurrentUser } from 'common.services';
import { cn, useMediaQuery } from '@xipkg/utils';

export const ClassroomsPage = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const isMobile = useMediaQuery('(max-width: 960px)');

  return (
    <div
      className={cn(
        'bg-gray-5 flex h-full flex-col gap-5',
        isMobile && 'max-h-[calc(100dvh-64px)]',
      )}
    >
      <div className="flex flex-col gap-5 px-5 pt-5">
        <DateTimeDisplay />
        <div className="space-between flex items-center">
          <h1 className="text-2xl font-normal text-gray-100">Кабинеты</h1>

          {isTutor && (
            <div className="ml-auto flex items-center gap-2">
              <LinkListStudents src="#" />
              <ButtonsHeader />
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          'min-h-0 flex-1 overflow-auto pr-4 pl-5',
          isMobile && 'h-[calc(100dvh-168px)]',
        )}
      >
        <CardsGridSimple />
      </div>

      <MobileTutorActionButton variant="classrooms" />
    </div>
  );
};
