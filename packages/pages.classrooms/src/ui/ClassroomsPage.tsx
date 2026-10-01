import { useRef } from 'react';
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
  const parentRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        'bg-background-page flex flex-col gap-4 p-5',
        isMobile ? 'h-full min-h-0 overflow-hidden pb-0' : 'h-screen',
      )}
    >
      <div className="flex w-full shrink-0 items-start justify-between sm:flex-row">
        <h1 className="font-playfair text-text-primary pb-2 text-2xl font-medium sm:text-4xl">
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
        ref={parentRef}
        className={cn(
          'min-h-0 flex-1 overflow-y-auto overscroll-contain',
          isMobile && isTutor && 'pb-20',
        )}
      >
        <CardsGridSimple parentRef={parentRef} />
      </div>
      <MobileTutorActionButton variant="classrooms" />
    </div>
  );
};
