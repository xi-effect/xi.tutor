/* eslint-disable no-irregular-whitespace */
import { useMemo, useState } from 'react';
import { Materials, Payments, Classrooms, FirstLessonGuideBanner } from './components';
import { DateTimeDisplay, OnboardingPopup } from 'common.ui';
import { useCurrentUser } from 'common.services';
import { useMediaQuery } from '@xipkg/utils';
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

  const steps = [
    {
      element: '#sidebar',
      popover: {
        description: `Используйте панель слева, чтобы открыть Главную страницу, Кабинеты, Материалы или Контроль оплат`,
      },
    },
    {
      element: '#userprofile',
      popover: {
        description: `${
          isTutor
            ? 'В настройках можно поменять почту и пароль, подключить мессенджеры для получения уведомлений и настроить ваше оборудование для проведения видеозвонков с учениками'
            : 'В настройках можно поменять почту и пароль, подключить мессенджеры для уведомлений и настроить видеозвонки'
        }`,
      },
      side: 'bottom' as const,
      align: 'end' as const,
    },
    {
      element: '#classrooms-menu-item',
      popover: {
        description: `Кабинет — виртуальное пространство для учёбы. В кабинете вы найдёте материалы, расписание и информацию об оплатах`,
      },
    },
    {
      element: '#userprofile',
      popover: {
        description: `${isTutor ? '' : 'Переходите по ссылкам-приглашениям от репетиторов, чтобы добавлять новые кабинеты'}`,
      },
      side: 'bottom' as const,
      align: 'end' as const,
    },
    {
      element: '#invite-student-button',
      popover: {
        description: 'Отправьте ученику ссылку-приглашение',
      },
      side: 'bottom' as const,
      align: 'end' as const,
    },
    {
      element: '#create-group-button',
      popover: {
        description: `Или создайте группу и приглашайте учеников по общей ссылке.<br />
Если вы назначите групповое занятие, каждый ученик группы получит уведомление.
Материалы группы доступны всем её участникам`,
      },
      side: 'bottom' as const,
      align: 'end' as const,
    },
    {
      element: '#materials-menu-item',
      popover: {
        description: `Храните онлайн-доски и заметки в Материалах`,
      },
      side: 'right' as const,
      align: 'start' as const,
    },
    {
      element: '#payments-menu-item',
      popover: {
        description: `Контроль оплат поможет вам отслеживать все финансы внутри платформы: предстоящие, совершённые и просроченные платежи`,
      },
    },
    {
      element: '#create-invoice-button',
      popover: {
        description: `Чтобы получить оплату за занятие, выставите ученику счёт.<br />
Если ученик не оплатит счет, вам не придется напоминать ему об этом: он получит автоматическое уведомление о просроченном платеже`,
      },
      side: 'bottom' as const,
      align: 'end' as const,
    },
    {
      element: '#hints-button',
      popover: {
        description: `${
          isTutor
            ? 'Если нужна помощь, нажмите сюда, чтобы посмотреть подсказки заново, или напишите в поддержку.<br />Желаем удачи!<br />Команда sovlium'
            : 'Если нужна помощь, посмотрите подсказки заново или напишите в поддержку.<br />Отличной учёбы!<br />Команда sovlium'
        }`,
      },
      side: 'right' as const,
      align: 'end' as const,
    },
  ];

  return (
    <div className="bg-gray-5 flex h-full min-h-0 flex-col">
      {/* Шапка на всю ширину контентной области; не участвует в прокрутке ниже */}
      {!isMobile && (
        <div className="shrink-0 p-5">
          <DateTimeDisplay />
        </div>
      )}
      {/* Ниже шапки — оставшаяся высота; справа один скролл по кабинетам / оплатам / материалам */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col items-start gap-4 p-5 sm:flex-row sm:py-0 sm:pr-0">
          {!isMobile && (
            <div className="lg:bg-gray-5 flex shrink-0 flex-col pb-6 lg:sticky lg:top-0 lg:z-10 lg:self-start">
              <Lessons />
            </div>
          )}
          {isMobile && !isNearestLoading && nearestLesson == null && (
            <div className="border-gray-10 bg-gray-0 flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed px-4 py-6 text-center">
              <p className="text-m-base font-semibold text-gray-100">Занятий нет</p>
              <p className="text-s-base text-gray-60">
                В ближайшие {NEAREST_LESSON_DAYS} дней занятий не запланировано
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
          <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-5 self-stretch overscroll-contain pb-6 sm:overflow-y-auto">
            {!isMobile && isTutor && <FirstLessonGuideBanner />}
            <Classrooms />
            <Payments />
            <Materials />
          </div>
        </div>
      </div>
      <OnboardingPopup steps={steps} disabled={false} />
    </div>
  );
};
