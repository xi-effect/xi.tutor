import { MobileTutorActionButton } from 'features.invites';
import { ButtonsHeader, LinkListStudents, CardsGridSimple } from './components';
import { useCurrentUser } from 'common.services';
import { cn, useMediaQuery } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

export const ClassroomsPage = () => {
  const { t } = useTranslation('classrooms');
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const isMobile = useMediaQuery('(max-width: 960px)');

  return (
    <div
      className={cn(
        'bg-background-page flex flex-col gap-4',
        isMobile ? 'max-h-[calc(100dvh-64px)]' : 'h-screen',
      )}
    >
      <div className="flex w-full shrink-0 items-start justify-between px-5 pt-4 sm:flex-row sm:px-8 sm:pt-8 md:px-10 md:pt-10">
        <h1 className="font-playfair text-text-primary pb-2 text-3xl font-medium sm:text-5xl">
          {t('title')}
        </h1>

        {isTutor && (
          <div className="hidden items-end gap-2 sm:flex">
            <LinkListStudents src="#" />
            <ButtonsHeader />
          </div>
        )}
      </div>
      <div
        className={cn(
          'h-full overflow-y-auto px-5 pb-5 sm:mt-10 sm:pr-5 sm:pl-8 md:pr-8 md:pl-10',
          !isMobile && 'flex-1',
        )}
      >
        <CardsGridSimple />
      </div>
      <MobileTutorActionButton variant="classrooms" />
    </div>
  );
};
