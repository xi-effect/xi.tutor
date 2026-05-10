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
// setTimeout хранит задержку в 32-битном знаковом целом.
// При превышении ~24.8 дней таймер срабатывает немедленно → canStartNow ложно становится true.
const MAX_SAFE_TIMEOUT_MS = 2_147_483_647;
const TOOLTIP_OPEN_DELAY_MS = 1000;
const SCHEDULE_TOOLTIP = 'Кнопка станет активной за 5 минут до начала занятия';
const SCHEDULE_TIMES_LOADING_TOOLTIP = 'Уточняем время занятия…';
const LESSON_ENDED_TOOLTIP = 'Нельзя начать занятие: прошло более 5 минут после окончания слота';

function isWithinStartWindow(startAt: Date): boolean {
  return startAt.getTime() - Date.now() <= FIVE_MINUTES_MS;
}

function isFiniteDate(d: Date): boolean {
  return Number.isFinite(d.getTime());
}

function getLabel(isTutor: boolean, isConferenceNotActiveTutor: boolean, isCallActive: boolean) {
  if (isTutor && isConferenceNotActiveTutor) return 'Начать занятие';
  if (isCallActive) return 'Вернуться в конференцию';
  return 'Присоединиться';
}

export type StartLessonButtonProps = {
  classroomId: number;
  /**
   * Если указано — включает режим расписания: кнопка тьютора заблокирована
   * до наступления окна в 5 минут перед занятием.
   */
  scheduledAt?: Date;
  /**
   * Если указано — включает проверку на окончание занятия: спустя 5 минут после
   * этого момента кнопка тьютора блокируется, если конференция не активна.
   */
  scheduledEndsAt?: Date;
  /** Вариант отображения кнопки. По умолчанию ghost. */
  variant?: 'ghost' | 'primary';
  size?: 's' | 'm';
  className?: string;
  /**
   * Кастомный обработчик начала занятия — перекрывает стандартный goto=call переход.
   * Используйте для прямого вызова API (например startCall() на странице кабинета).
   */
  onStart?: () => void | Promise<void>;
  /**
   * Пока грузятся точные границы слота (например API инстанса для repeated_virtual) —
   * для тьютора кнопка остаётся неактивной, чтобы не опираться на неверные даты из списка.
   */
  scheduleTimesLoading?: boolean;
};

export const StartLessonButton = ({
  classroomId,
  scheduledAt,
  scheduledEndsAt,
  variant = 'ghost',
  size = 's',
  className,
  onStart,
  scheduleTimesLoading = false,
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

  // Ленивая загрузка запросов — только когда карточка попала в viewport
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

  const { isConferenceNotActive: isConferenceNotActiveStudent, isLoading: isLoadingStudent } =
    useGetParticipantsByStudent(classroomId.toString(), isTutor || !hasBeenVisible);
  const { isConferenceNotActive: isConferenceNotActiveTutor, isLoading: isLoadingTutor } =
    useGetParticipantsByTutor(classroomId.toString(), !isTutor || !hasBeenVisible);

  const { call } = search;
  const updateStore = useCallStore((state) => state.updateStore);
  const activeClassroom = useCallStore((state) => state.activeClassroom);
  const isStarted = useCallStore((state) => state.isStarted);
  const token = useCallStore((state) => state.token);

  const normalizedCallId = typeof call === 'string' ? call.replace(/^"|"$/g, '').trim() : undefined;
  const classroomIdStr = classroomId.toString();
  /** Активный звонок именно для этого кабинета: query `call`, либо store (PiP / вкладка без call в URL). */
  const isCallActive = Boolean(
    isStarted &&
    token &&
    (normalizedCallId === classroomIdStr || activeClassroom === classroomIdStr),
  );

  // --- Режим расписания: блокировка до 5 минут перед началом ---
  const scheduledMode = scheduledAt != null || scheduledEndsAt != null;
  const scheduleStartTs =
    scheduledAt != null && isFiniteDate(scheduledAt) ? scheduledAt.getTime() : null;
  const hasInvalidScheduledStart = scheduledAt != null && scheduleStartTs == null;

  const [canStartNow, setCanStartNow] = useState(() => {
    if (scheduleStartTs == null) return true;
    return isWithinStartWindow(new Date(scheduleStartTs));
  });

  useEffect(() => {
    if (scheduleStartTs == null) {
      setCanStartNow(true);
      return;
    }
    const within = isWithinStartWindow(new Date(scheduleStartTs));
    setCanStartNow(within);
    if (within) return;
    const msUntilWindow = scheduleStartTs - Date.now() - FIVE_MINUTES_MS;
    // Занятие слишком далеко: setTimeout с задержкой > 24.8 дней переполняет 32-битный int
    // и срабатывает немедленно — не устанавливаем таймер, компонент пересчитается при следующем монтировании.
    if (msUntilWindow > MAX_SAFE_TIMEOUT_MS) return;
    const id = setTimeout(() => setCanStartNow(true), msUntilWindow);
    return () => clearTimeout(id);
  }, [scheduleStartTs]);

  // --- Режим расписания: блокировка спустя 5 минут после окончания ---
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
  }, [scheduledEndsAt]);

  const isTooLateForTutorToStart =
    scheduledMode && isTutor && pastLessonGracePeriod && isConferenceNotActiveTutor;
  const isTimeRestricted =
    scheduledMode &&
    isTutor &&
    (hasInvalidScheduledStart ||
      (scheduleStartTs == null && scheduledEndsAt != null) ||
      (scheduleStartTs != null && !canStartNow));

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

  const handleStartLesson = async () => {
    if (onStart) {
      await onStart();
      return;
    }
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
  // Ограничения по слоту не должны блокировать возврат в уже идущий звонок
  const scheduleLocksTutor =
    !isCallActive &&
    ((scheduleTimesLoading && isTutor) || isTimeRestricted || isTooLateForTutorToStart);
  const isDisabled = scheduleLocksTutor || isDisabledStudent;

  const label = getLabel(isTutor, isConferenceNotActiveTutor, isCallActive);

  const button = (
    <Button
      size={size}
      variant={variant}
      className={cn(
        variant === 'ghost' && 'text-brand-80 group hover:text-brand-100 h-[32px] w-full',
        variant === 'primary' && 'group w-full pr-2 pl-2',
        isDisabled && 'cursor-not-allowed',
        className,
      )}
      onClick={isCallActive ? handleBackToRoom : handleStartLesson}
      disabled={isDisabled}
      data-umami-event={isTutor ? 'classroom-start-lesson' : 'classroom-join-lesson'}
      data-umami-event-classroom-id={classroomId}
    >
      {variant === 'primary' && (
        <Conference
          size="sm"
          className={cn(
            'group-hover:fill-gray-0 fill-brand-0 mr-1.5',
            isDisabled && 'fill-gray-40',
          )}
        />
      )}
      {label}
      {variant === 'ghost' && (
        <Conference
          className={cn(
            'group-hover:fill-brand-100 fill-brand-80 ml-2',
            isDisabled && 'fill-gray-40',
          )}
        />
      )}
    </Button>
  );

  const tooltipText =
    !isCallActive && isTooLateForTutorToStart
      ? LESSON_ENDED_TOOLTIP
      : !isCallActive && scheduleTimesLoading && isTutor
        ? SCHEDULE_TIMES_LOADING_TOOLTIP
        : !isCallActive && isTimeRestricted
          ? SCHEDULE_TOOLTIP
          : null;

  if (tooltipText) {
    return (
      <div ref={cardRef} className="w-full">
        <Tooltip delayDuration={TOOLTIP_OPEN_DELAY_MS}>
          <TooltipTrigger asChild>
            <span className="w-full">{button}</span>
          </TooltipTrigger>
          <TooltipContent>{tooltipText}</TooltipContent>
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
