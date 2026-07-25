/* eslint-disable no-irregular-whitespace */
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Materials, Payments, Classrooms, FirstLessonGuideBanner } from './components';
import { MobileTutorActionButton } from 'features.invites';
import { OnboardingPopup } from 'common.ui';
import { useCurrentUser } from 'common.services';
import { cn, useMediaQuery } from '@xipkg/utils';
import { NearestLessonCard, useStudentSchedule, useTutorSchedule } from 'modules.calendar';
import { MovingLessonModal } from 'features.lesson.move';
import { Lessons } from './components/Lessons/Lessons';
import {
  movingPropsFromLessonRow,
  scheduleItemToLessonRow,
} from './components/Lessons/scheduleHelpers';

const NEAREST_LESSON_DAYS = 7;

const getNearestLessonRange = () => {
  const now = new Date();
  const before = new Date(now);
  before.setDate(before.getDate() + NEAREST_LESSON_DAYS);
  return {
    happensAfter: now.toISOString(),
    happensBefore: before.toISOString(),
  };
};

export const MainPage = () => {
  const { t } = useTranslation('main');
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const isMobile = useMediaQuery('(max-width: 720px)');
  const [moveLessonOpen, setMoveLessonOpen] = useState(false);

  const range = useMemo(getNearestLessonRange, []);
  const tutorScheduleQuery = useTutorSchedule({
    ...range,
    enabled: isMobile && !isUserLoading && isTutor === true,
  });
  const studentScheduleQuery = useStudentSchedule({
    ...range,
    enabled: isMobile && !isUserLoading && isTutor === false,
  });
  const scheduleQuery = isTutor ? tutorScheduleQuery : studentScheduleQuery;

  const isNearestLoading = isUserLoading || scheduleQuery.isLoading;

  const nearestLesson = useMemo(() => {
    const items = scheduleQuery.data ?? [];
    const upcoming = items
      .filter((item) => item.cancelledAt == null)
      .filter((item) => new Date(item.endsAt).getTime() > Date.now())
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    return upcoming[0] ? scheduleItemToLessonRow(upcoming[0]) : null;
  }, [scheduleQuery.data]);

  const steps = useMemo(
    () => [
      {
        element: '#sidebar',
        popover: {
          description: t('onboarding.sidebar'),
        },
      },
      {
        element: '#userprofile',
        popover: {
          description: isTutor
            ? t('onboarding.userProfileTutor')
            : t('onboarding.userProfileStudent'),
        },
        side: 'bottom' as const,
        align: 'end' as const,
      },
      {
        element: '#classrooms-menu-item',
        popover: {
          description: t('onboarding.classrooms'),
        },
      },
      {
        element: '#userprofile',
        popover: {
          description: isTutor ? '' : t('onboarding.inviteLinksStudent'),
        },
        side: 'bottom' as const,
        align: 'end' as const,
      },
      {
        element: '#invite-student-button',
        popover: {
          description: t('onboarding.inviteStudent'),
        },
        side: 'bottom' as const,
        align: 'end' as const,
      },
      {
        element: '#create-group-button',
        popover: {
          description: t('onboarding.createGroup'),
        },
        side: 'bottom' as const,
        align: 'end' as const,
      },
      {
        element: '#materials-menu-item',
        popover: {
          description: t('onboarding.materials'),
        },
        side: 'right' as const,
        align: 'start' as const,
      },
      {
        element: '#payments-menu-item',
        popover: {
          description: t('onboarding.payments'),
        },
      },
      {
        element: '#create-invoice-button',
        popover: {
          description: t('onboarding.createInvoice'),
        },
        side: 'bottom' as const,
        align: 'end' as const,
      },
      {
        element: '#hints-button',
        popover: {
          description: isTutor ? t('onboarding.hintsTutor') : t('onboarding.hintsStudent'),
        },
        side: 'right' as const,
        align: 'end' as const,
      },
    ],
    [isTutor, t],
  );

  return (
    <div
      className={cn(
        'bg-background-page flex flex-col',
        isMobile
          ? 'max-h-[calc(100dvh-64px)] overflow-y-auto overscroll-contain'
          : 'h-full min-h-0',
      )}
    >
      {/* На мобильных — одна прокрутка всей страницы; на десктопе — только правая колонка */}
      <div className={cn('flex flex-col', !isMobile && 'min-h-0 flex-1')}>
        <div
          className={cn(
            'flex flex-col items-start gap-4 p-5',
            isMobile ? 'pb-12' : 'min-h-0 flex-1 sm:flex-row sm:pt-5 sm:pr-0 sm:pb-0',
          )}
        >
          {!isMobile && (
            <div className="lg:bg-background-page flex shrink-0 flex-col pb-6 lg:sticky lg:top-0 lg:z-10 lg:self-start">
              <Lessons />
            </div>
          )}
          {isMobile && !isNearestLoading && nearestLesson == null && (
            <div className="border-border-default bg-background-surface flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed px-4 py-6 text-center">
              <p className="text-m-base text-text-primary font-semibold">
                {t('nearestLessons.emptyTitle')}
              </p>
              <p className="text-s-base text-text-secondary">
                {t('nearestLessons.emptyDescription', { days: NEAREST_LESSON_DAYS })}
              </p>
            </div>
          )}
          {isMobile && nearestLesson != null && (
            <>
              <NearestLessonCard
                lesson={nearestLesson}
                onReschedule={() => setMoveLessonOpen(true)}
              />
              <MovingLessonModal
                open={moveLessonOpen}
                onOpenChange={setMoveLessonOpen}
                {...movingPropsFromLessonRow(nearestLesson)}
              />
            </>
          )}
          <div
            className={cn(
              'flex w-full min-w-0 flex-col gap-5 self-stretch',
              !isMobile && 'min-h-0 flex-1 overscroll-contain pb-6 sm:overflow-y-auto',
            )}
          >
            {!isMobile && isTutor && <FirstLessonGuideBanner />}
            <Classrooms />
            <Payments />
            {isTutor && <Materials />}
          </div>
        </div>
      </div>
      <MobileTutorActionButton variant="main" />
      <OnboardingPopup steps={steps} disabled={false} />
    </div>
  );
};
