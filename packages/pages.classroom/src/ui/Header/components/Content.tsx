import { ArrowLeft } from '@xipkg/icons';
import { ClassroomTutorResponseSchema } from 'common.api';
import { IndividualUser } from './IndividualUser';
import { Button } from '@xipkg/button';
import { SubjectBadge } from './SubjectBadge';
import { useEffect, useCallback, useRef } from 'react';
import { useStartCall } from 'modules.calls';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { StatusBadge } from '../../StatusBadge';
import { ContactsBadge } from './ContactsBadge';
import { useCurrentUser } from 'common.services';
import { StartLessonButton } from 'features.lesson.start';

interface ContentProps {
  classroom: ClassroomTutorResponseSchema;
}

export const Content = ({ classroom }: ContentProps) => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const navigate = useNavigate();
  const { startCall } = useStartCall();
  const search = useSearch({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const hasHandledGotoCallRef = useRef(false);

  // Единая обработка goto=call (один раз на страницу), чтобы не дублировать запрос при двух рендерах StartLessonButton (мобильный + десктоп)
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

  const handleStartCall = useCallback(async () => {
    try {
      await startCall({ classroom_id: classroom.id.toString() });
    } catch (error) {
      console.error('Ошибка при запуске звонка:', error);
    }
  }, [startCall, classroom.id]);

  const getDisplayName = () => {
    if (classroom.kind === 'individual') {
      return `${classroom.student.first_name} ${classroom.student.last_name}`;
    } else {
      return classroom.name;
    }
  };

  return (
    <div className="flex flex-row items-start gap-4 pt-4 pr-5 pb-5">
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex w-full min-w-0 flex-row items-center gap-2 sm:w-auto sm:gap-3">
          <Button
            variant="none"
            type="button"
            onClick={() => navigate({ to: '/classrooms' })}
            className="text-gray-80 hover:bg-gray-5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl p-0"
            aria-label="К списку кабинетов"
            data-umami-event="classroom-back-to-classrooms"
          >
            <ArrowLeft size="s" className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1 sm:flex-initial">
            {classroom.kind === 'individual' ? (
              <IndividualUser userId={classroom.student_id ?? classroom.tutor_id ?? 0} />
            ) : (
              <div className="flex w-full max-w-[min(100%,300px)] min-w-0 flex-row items-center gap-2 sm:w-fit sm:max-w-[300px] sm:shrink">
                <div className="bg-brand-80 text-gray-0 flex h-12 w-12 shrink-0 items-center justify-center rounded-[24px]">
                  {getDisplayName()?.[0].toUpperCase() ?? ''}
                </div>
                <div className="text-xl-base min-w-0 truncate font-semibold text-gray-100">
                  {getDisplayName()}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex w-full min-w-0 flex-row flex-nowrap gap-2 sm:w-auto sm:shrink-0 sm:flex-wrap sm:items-center max-sm:[&>*]:min-w-0 max-sm:[&>*]:flex-1 max-sm:[&>*]:basis-0">
          {classroom.subject_id && <SubjectBadge subject_id={classroom.subject_id} />}

          <StatusBadge status={classroom.status} kind={classroom.kind} />

          {classroom.kind === 'individual' && (
            <ContactsBadge userId={classroom.student_id ?? classroom.tutor_id ?? 0} />
          )}
          {classroom.kind === 'group' && !isTutor && (
            <ContactsBadge userId={classroom.tutor_id ?? 0} />
          )}
        </div>
        <div className="w-full sm:hidden">
          <StartLessonButton
            classroomId={classroom.id}
            variant="primary"
            onStart={handleStartCall}
          />
        </div>
      </div>

      <div className="ml-auto hidden h-full shrink-0 flex-col items-center justify-center gap-2 sm:flex">
        <StartLessonButton classroomId={classroom.id} variant="primary" onStart={handleStartCall} />
      </div>
    </div>
  );
};
