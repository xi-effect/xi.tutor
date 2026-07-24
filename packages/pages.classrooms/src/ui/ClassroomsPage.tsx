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
          : 'h-screen',
      )}
    >
      <div className="shrink-0 px-5 pt-5 sm:px-10 sm:pt-10">
        <div className="inline-flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="font-playfair text-text-primary pb-2 text-3xl font-medium sm:text-5xl">
            Кабинеты
          </h1>

          {isTutor && (
            <div className="hidden items-center justify-start gap-2 sm:flex">
              <LinkListStudents src="#" />
              <ButtonsHeader />
            </div>
          )}
        </div>
      </div>

      <div className={cn('mt-6 sm:mt-10', !isMobile && 'min-h-0 flex-1')}>
        <CardsGridSimple />
      </div>

      <MobileTutorActionButton variant="classrooms" />
    </div>
  );
};
