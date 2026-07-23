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
        'bg-background-page flex flex-col',
        isMobile
          ? 'max-h-[calc(100dvh-64px)] overflow-y-auto overscroll-contain pb-24'
          : 'h-full min-h-0 flex-1',
      )}
    >
      <div className="flex shrink-0 flex-row items-center px-5 pt-5 pb-4">
        <h1 className="text-text-primary text-2xl font-normal">Кабинеты</h1>

        <div className="mr-2 ml-auto flex items-center">
          {isTutor && <LinkListStudents src="#" />}
        </div>

        {isTutor && <ButtonsHeader />}
      </div>

      <div className={cn(!isMobile && 'min-h-0 flex-1')}>
        <CardsGridSimple />
      </div>

      <MobileTutorActionButton variant="classrooms" />
    </div>
  );
};
