import { Conference } from '@xipkg/icons';
import { ClassroomTutorResponseSchema } from 'common.api';
import { IndividualUser } from './IndividualUser';
import { Button } from '@xipkg/button';
import { SubjectBadge } from './SubjectBadge';
import { useEffect, useCallback, useRef } from 'react';
import { useCallStore, useStartCall } from 'modules.calls';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { StatusBadge } from '../../StatusBadge';
import { ContactsBadge } from './ContactsBadge';
import { cn } from '@xipkg/utils';
import {
  useCurrentUser,
  useGetParticipantsByStudent,
  useGetParticipantsByTutor,
} from 'common.services';

interface ContentProps {
  classroom: ClassroomTutorResponseSchema;
}

const getButtonLabel = (
  isTutor: boolean,
  isConferenceNotActiveTutor: boolean,
  isCallActive: boolean,
) => {
  // Преподаватель и конференция не активна
  if (isTutor && isConferenceNotActiveTutor) return 'Начать занятие';
  if (isCallActive) return 'Вернутся в конференцию';

  return 'Присоединиться';
};

const CallButton = ({ classroom }: { classroom: ClassroomTutorResponseSchema }) => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const { startCall } = useStartCall();

  const handleCallClick = useCallback(async () => {
    try {
      // Запускаем процесс создания токена, сохранения в store и навигации
      await startCall({ classroom_id: classroom.id.toString() });
    } catch (error) {
      console.error('Ошибка при запуске звонка:', error);
      // Здесь можно добавить показ уведомления об ошибке
    }
  }, [startCall, classroom.id]);

  const { isConferenceNotActive: isConferenceNotActiveStudent, isLoading: isLoadingStudent } =
    useGetParticipantsByStudent(classroom.id.toString(), isTutor);
  const { isConferenceNotActive: isConferenceNotActiveTutor, isLoading: isLoadingTutor } =
    useGetParticipantsByTutor(classroom.id.toString(), !isTutor);

  const navigate = useNavigate();
  const { call } = useSearch({ strict: false }) as { call?: string };
  const params = useParams({ strict: false }) as {
    callId?: string;
    classroomId?: string;
    boardId?: string;
  };
  const updateStore = useCallStore((state) => state.updateStore);

  const activeClassroom = useCallStore((state) => state.activeClassroom);
  const isStarted = useCallStore((state) => state.isStarted);
  const token = useCallStore((state) => state.token);

  const normalizedCallId = typeof call === 'string' ? call.replace(/^"|"$/g, '').trim() : undefined;

  const isCallActive = Boolean(isStarted && token && normalizedCallId === classroom.id.toString());

  const handleBackToRoom = () => {
    if (!token || !isStarted) {
      return;
    }

    const targetCallId =
      normalizedCallId ||
      activeClassroom ||
      params.classroomId ||
      params.callId ||
      classroom.id.toString();

    updateStore('localFullView', true);
    updateStore('mode', 'full');

    navigate({
      to: '/call/$callId',
      params: { callId: targetCallId },
      search: { call: targetCallId },
      replace: true,
    });
  };

  return (
    <div className="flex w-full flex-row items-end gap-2">
      {isLoadingStudent || isLoadingTutor ? (
        <Button size="s" className="group mt-auto w-full" disabled loading />
      ) : (
        <Button
          size="s"
          variant="primary"
          className="group w-full pr-2 pl-2"
          onClick={isCallActive ? handleBackToRoom : handleCallClick}
          disabled={!isTutor && isConferenceNotActiveStudent}
          data-umami-event={isTutor ? 'classroom-start-lesson' : 'classroom-join-lesson'}
          data-umami-event-classroom-id={classroom.id}
        >
          <Conference
            size="sm"
            className={cn(
              'group-hover:fill-gray-0 fill-brand-0 mr-1.5',
              !isTutor && isConferenceNotActiveStudent && 'fill-gray-40',
            )}
          />
          {getButtonLabel(isTutor, isConferenceNotActiveTutor, isCallActive)}
        </Button>
      )}
    </div>
  );
};

export const Content = ({ classroom }: ContentProps) => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const { startCall } = useStartCall();
  const search = useSearch({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const hasHandledGotoCallRef = useRef(false);

  // Единая обработка goto=call (один раз на страницу), чтобы не дублировать запрос при двух рендерах CallButton (мобильный + десктоп)
  useEffect(() => {
    const searchParams = search as { goto?: string };
    if (hasHandledGotoCallRef.current || !searchParams.goto || searchParams.goto !== 'call') {
      return;
    }
    hasHandledGotoCallRef.current = true;
    const url = new URL(window.location.href);
    url.searchParams.delete('goto');
    window.history.replaceState({}, '', url.toString());
    setTimeout(() => {
      startCall({ classroom_id: classroom.id.toString() }).catch((error) => {
        console.error('Ошибка при запуске звонка (goto=call):', error);
      });
    }, 100);
  }, [search, startCall, classroom.id]);

  const getDisplayName = () => {
    if (classroom.kind === 'individual') {
      return `${classroom.student.first_name} ${classroom.student.last_name}`;
    } else {
      return classroom.name;
    }
  };

  return (
    <div className="flex flex-row items-start px-4 pb-2">
      <div className="flex w-full flex-col items-start gap-4">
        {classroom.kind === 'individual' ? (
          <IndividualUser userId={classroom.student_id ?? classroom.tutor_id ?? 0} />
        ) : (
          <div className="flex flex-row items-center gap-2">
            <div className="bg-brand-80 text-gray-0 flex h-12 w-12 items-center justify-center rounded-[24px]">
              {getDisplayName()?.[0].toUpperCase() ?? ''}
            </div>
            <div className="text-xl-base font-semibold text-gray-100">{getDisplayName()}</div>
          </div>
        )}
        <div className="flex flex-row items-center gap-2">
          {classroom.subject_id && <SubjectBadge subject_id={classroom.subject_id} />}

          <StatusBadge status={classroom.status} kind={classroom.kind} />

          {classroom.kind === 'individual' && (
            <ContactsBadge userId={classroom.student_id ?? classroom.tutor_id ?? 0} />
          )}
          {classroom.kind === 'group' && !isTutor && (
            <ContactsBadge userId={classroom.tutor_id ?? 0} />
          )}
        </div>
        <div className="flex w-full sm:hidden">
          <CallButton classroom={classroom} />
        </div>
      </div>

      <div className="ml-auto hidden flex-col items-end gap-2 sm:flex">
        <CallButton classroom={classroom} />
      </div>
    </div>
  );
};
