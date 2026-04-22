import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { Button } from '@xipkg/button';
import { Conference } from '@xipkg/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { cn } from '@xipkg/utils';
import {
  useCurrentUser,
  useGetParticipantsByStudent,
  useGetParticipantsByTutor,
} from 'common.services';
import { useCallStore } from 'modules.calls';

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const TOOLTIP_OPEN_DELAY_MS = 1000;
const SCHEDULE_TOOLTIP = 'Кнопка станет активной за 5 минут до начала занятия';
const LESSON_ENDED_TOOLTIP = 'Нельзя начать занятие: прошло более 5 минут после окончания слота';

function isWithinStartWindow(startAt: Date): boolean {
  return startAt.getTime() - Date.now() <= FIVE_MINUTES_MS;
}

function getLabel(isTutor: boolean, isConferenceNotActiveTutor: boolean, isCallActive: boolean) {
  if (isTutor && isConferenceNotActiveTutor) return 'Начать занятие';
  if (isCallActive) return 'Вернуться в конференцию';
  return 'Присоединиться';
}

export type StartLessonButtonProps = {
  classroomId: number;
  /**
   * Если указано — режим расписания: кнопка преподавателя заблокирована
   * до наступления окна в 5 минут перед занятием.
   */
  scheduledAt?: Date;
  /**
   * Окончание слота: для преподавателя блокирует «Начать занятие» через 5 минут
   * после этого момента (пока нет активного звонка).
   */
  scheduledEndsAt?: Date;
  className?: string;
  size?: 's' | 'm';
};

export const StartLessonButton = ({
  classroomId,
  scheduledAt,
  scheduledEndsAt,
  className,
  size = 's',
}: StartLessonButtonProps) => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { call?: string };
  const params = useParams({ strict: false }) as {
    callId?: string;
    classroomId?: string;
    boardId?: string;
  };

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const cardRef = useRef<HTMLDivElement>(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    if (hasBeenVisible) return;
    if (typeof IntersectionObserver === 'undefined') {
      setHasBeenVisible(true);
      return;
    }
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px', threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasBeenVisible]);

  const disableStudentQuery = isTutor || !hasBeenVisible;
  const disableTutorQuery = !isTutor || !hasBeenVisible;

  const { isConferenceNotActive: isConferenceNotActiveStudent, isLoading: isLoadingStudent } =
    useGetParticipantsByStudent(classroomId.toString(), disableStudentQuery);
  const { isConferenceNotActive: isConferenceNotActiveTutor, isLoading: isLoadingTutor } =
    useGetParticipantsByTutor(classroomId.toString(), disableTutorQuery);

  const searchCall = search;
  const { call } = searchCall;
  const updateStore = useCallStore((state) => state.updateStore);
  const activeClassroom = useCallStore((state) => state.activeClassroom);
  const isStarted = useCallStore((state) => state.isStarted);
  const token = useCallStore((state) => state.token);

  const normalizedCallId = typeof call === 'string' ? call.replace(/^"|"$/g, '').trim() : undefined;
  const isCallActive = Boolean(isStarted && token && normalizedCallId === classroomId.toString());

  // Расписание: кнопка туторa блокируется до окна 5 минут
  const [canStartNow, setCanStartNow] = useState(() =>
    scheduledAt ? isWithinStartWindow(scheduledAt) : true,
  );

  useEffect(() => {
    if (!scheduledAt) return;
    if (canStartNow) return;

    const msUntilWindow = scheduledAt.getTime() - Date.now() - FIVE_MINUTES_MS;
    if (msUntilWindow <= 0) {
      setCanStartNow(true);
      return;
    }

    const timer = setTimeout(() => setCanStartNow(true), msUntilWindow);
    return () => clearTimeout(timer);
  }, [scheduledAt, canStartNow]);

  const [pastLessonGracePeriod, setPastLessonGracePeriod] = useState(false);

  useEffect(() => {
    if (!scheduledEndsAt) {
      setPastLessonGracePeriod(false);
      return;
    }
    const graceEndMs = scheduledEndsAt.getTime() + FIVE_MINUTES_MS;
    const sync = () => setPastLessonGracePeriod(Date.now() > graceEndMs);
    sync();
    if (Date.now() >= graceEndMs) return;
    const id = setTimeout(sync, graceEndMs - Date.now() + 1);
    return () => clearTimeout(id);
  }, [scheduledEndsAt, classroomId]);

  const isTooLateForTutorToStart = isTutor && pastLessonGracePeriod && !isCallActive;

  const isTimeRestricted = isTutor && scheduledAt != null && !canStartNow;

  const handleBackToRoom = () => {
    if (!token || !isStarted) return;
    const targetCallId =
      normalizedCallId ||
      activeClassroom ||
      params.classroomId ||
      params.callId ||
      classroomId.toString();

    updateStore('localFullView', true);
    updateStore('mode', 'full');
    navigate({
      to: '/call/$callId',
      params: { callId: targetCallId },
      search: { call: targetCallId },
      replace: true,
    });
  };

  const handleStartLesson = () => {
    window.location.href = `/classrooms/${classroomId}?goto=call`;
  };

  if (isLoadingStudent || isLoadingTutor) {
    return (
      <div ref={cardRef} className={cn('w-full', className)}>
        <Button size={size} className="h-[32px] w-full" disabled loading />
      </div>
    );
  }

  const isDisabledStudent = !isTutor && isConferenceNotActiveStudent;
  const isDisabled = isTimeRestricted || isTooLateForTutorToStart || isDisabledStudent;

  const button = (
    <Button
      size={size}
      variant="ghost"
      className={cn(
        'text-brand-80 group hover:text-brand-100 h-[32px] w-full',
        isDisabled && 'cursor-not-allowed',
        className,
      )}
      onClick={isCallActive ? handleBackToRoom : handleStartLesson}
      disabled={isDisabled}
      data-umami-event={isTutor ? 'classroom-start-lesson' : 'classroom-join-lesson'}
      data-umami-event-classroom-id={classroomId}
    >
      {getLabel(isTutor, isConferenceNotActiveTutor, isCallActive)}
      <Conference
        className={cn(
          'group-hover:fill-brand-100 fill-brand-80 ml-2',
          isDisabled && 'fill-gray-40',
        )}
      />
    </Button>
  );

  if (isTimeRestricted) {
    return (
      <div ref={cardRef} className="w-full">
        <Tooltip delayDuration={TOOLTIP_OPEN_DELAY_MS}>
          <TooltipTrigger asChild>
            <span className="w-full">{button}</span>
          </TooltipTrigger>
          <TooltipContent>{SCHEDULE_TOOLTIP}</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  if (isTooLateForTutorToStart) {
    return (
      <div ref={cardRef} className="w-full">
        <Tooltip delayDuration={TOOLTIP_OPEN_DELAY_MS}>
          <TooltipTrigger asChild>
            <span className="w-full">{button}</span>
          </TooltipTrigger>
          <TooltipContent>{LESSON_ENDED_TOOLTIP}</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div ref={cardRef} className="w-full">
      {button}
    </div>
  );
};
