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
        'bg-gray-5 flex flex-col',
        isMobile
          ? 'max-h-[calc(100dvh-64px)] overflow-y-auto overscroll-contain pb-24'
          : 'h-full min-h-0 flex-1',
      )}
    >
      <div className="flex shrink-0 flex-col gap-5 px-5 pt-5">
        <div className="flex h-8 items-center">
          <DateTimeDisplay />
        </div>
        <div className="flex flex-row items-center pb-4">
          <h1 className="text-2xl font-normal text-gray-100">Кабинеты</h1>

          <div className="mr-2 ml-auto flex items-center">
            {isTutor && <LinkListStudents src="#" />}
          </div>

          {isTutor && <ButtonsHeader />}
        </div>
      </div>

      <div className={cn(!isMobile && 'min-h-0 flex-1')}>
        <CardsGridSimple />
      </div>

      <MobileTutorActionButton variant="classrooms" />
    </div>
  );
};
