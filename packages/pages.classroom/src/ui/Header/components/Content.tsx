import { type ReactNode, useCallback, useEffect, useRef } from 'react';
import { ClassroomTutorResponseSchema } from 'common.api';
import { IndividualUser } from './IndividualUser';
import { SubjectBadge } from './SubjectBadge';
import { useStartCall } from 'modules.calls';
import { useSearch } from '@tanstack/react-router';
import { StatusBadge } from '../../StatusBadge';
import { ContactsBadge } from './ContactsBadge';
import { useCurrentUser } from 'common.services';
import { StartLessonButton } from 'features.lesson.start';
import { EditableClassroomName } from './EditableClassroomName';

interface ContentProps {
  classroom: ClassroomTutorResponseSchema;
}

const startLessonButtonClass =
  '!h-auto gap-2 rounded-[10px] px-5 py-3 text-base leading-5 font-medium';

export const Content = ({ classroom }: ContentProps) => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const { startCall } = useStartCall();
  const search = useSearch({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const hasHandledGotoCallRef = useRef(false);

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
      startCall({ classroom_id: classroom.id.toString() }, { source: 'classroom' }).catch(
        (error) => {
          console.error('Ошибка при запуске звонка (goto=call):', error);
        },
      );
    }, 100);
  }, [search, startCall, classroom.id]);

  const handleStartCall = useCallback(async () => {
    try {
      await startCall({ classroom_id: classroom.id.toString() }, { source: 'classroom' });
    } catch (error) {
      console.error('Ошибка при запуске звонка:', error);
    }
  }, [startCall, classroom.id]);

  const getStudentName = () => {
    if (classroom.kind !== 'individual') return '';
    const displayName = classroom.student?.display_name?.trim();
    if (displayName) return displayName;
    const username = classroom.student?.username?.trim();
    if (username) return username;
    const firstName = classroom.student?.first_name?.trim() ?? '';
    const lastName = classroom.student?.last_name?.trim() ?? '';
    return `${firstName} ${lastName}`.trim();
  };

  const getDisplayName = () => {
    if (classroom.kind === 'individual') {
      const override = classroom.name_override?.trim();
      if (isTutor && override) return override;
      return classroom.name?.trim() || getStudentName();
    }
    return classroom.name ?? '';
  };

  const badges: ReactNode = (
    <div className="flex shrink-0 items-center gap-2">
      {classroom.subject_id ? <SubjectBadge subject_id={classroom.subject_id} /> : null}
      <StatusBadge status={classroom.status} kind={classroom.kind} />
      {classroom.kind === 'individual' ? (
        <ContactsBadge
          userId={classroom.student_id ?? classroom.student?.id ?? classroom.tutor_id ?? 0}
        />
      ) : null}
      {classroom.kind === 'group' && !isTutor ? (
        <ContactsBadge userId={classroom.tutor_id ?? 0} />
      ) : null}
    </div>
  );

  return (
    <div className="flex w-full shrink-0 flex-col gap-4 px-5 pt-5 sm:px-8 sm:pt-8 md:px-10 md:pt-10">
      <div className="flex min-w-0 flex-row items-center gap-3 sm:gap-4">
        <div className="flex min-w-0 flex-1 flex-row items-center gap-3">
          {classroom.kind === 'individual' ? (
            <IndividualUser
              userId={classroom.student_id ?? classroom.student?.id ?? classroom.tutor_id ?? 0}
              classroomId={classroom.id}
              nameOverride={isTutor ? classroom.name_override : undefined}
              classroomName={classroom.name}
              studentName={getStudentName()}
              canEdit={isTutor}
            />
          ) : (
            <div className="flex min-w-0 flex-1 flex-row items-center gap-3">
              <div className="bg-action-primary-background-default text-text-on-accent flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-medium">
                {getDisplayName()?.[0]?.toUpperCase() ?? ''}
              </div>
              <EditableClassroomName
                classroomId={classroom.id}
                kind="group"
                name={getDisplayName() ?? ''}
                canEdit={isTutor}
              />
            </div>
          )}
          {badges}
        </div>

        <div className="hidden shrink-0 sm:block">
          <StartLessonButton
            className={startLessonButtonClass}
            classroomId={classroom.id}
            variant="primary"
            size="m"
            onStart={handleStartCall}
          />
        </div>
      </div>

      <div className="w-full sm:hidden">
        <StartLessonButton
          className={`${startLessonButtonClass} w-full`}
          classroomId={classroom.id}
          variant="primary"
          size="m"
          onStart={handleStartCall}
        />
      </div>
    </div>
  );
};
