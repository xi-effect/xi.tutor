import { Button } from '@xipkg/button';
import { Add, ArrowRight } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { useNavigate } from '@tanstack/react-router';
import { useCurrentUser, useFetchClassrooms, useFetchClassroomsByStudent } from 'common.services';
import { useState, useMemo } from 'react';
import { Classroom } from './Classroom';
import { useNoteVisibility } from '../../../hooks';
import { NoteForStudent } from './NoteForStudent';
import { cn } from '@xipkg/utils';

export const Classrooms = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const { data: tutorClassrooms, isLoading: isTutorLoading } = useFetchClassrooms(
    undefined,
    !isTutor,
  );
  const { data: studentClassrooms, isLoading: isStudentLoading } = useFetchClassroomsByStudent(
    undefined,
    isTutor,
  );

  const classrooms = isTutor ? tutorClassrooms : studentClassrooms;
  const isLoading = isTutor ? isTutorLoading : isStudentLoading;

  const { isHidden, hideNote } = useNoteVisibility(isTutor);
  const [selectedSubject] = useState<string>('all');
  const navigate = useNavigate();

  const filteredClassrooms = useMemo(() => {
    if (!classrooms) return [];
    if (!isTutor) return classrooms;

    return classrooms.filter((classroom) => {
      const matchesSubject =
        selectedSubject === 'all' ||
        (selectedSubject === 'english' && classroom.subject_id === 1) ||
        (selectedSubject === 'math' && classroom.subject_id === 2);
      return matchesSubject;
    });
  }, [classrooms, selectedSubject, isTutor]);

  const handleMore = () => {
    navigate({ to: '/classrooms' });
  };

  const emptyMessage = isTutor
    ? selectedSubject !== 'all'
      ? 'Ничего не найдено'
      : 'Пригласите учеников — индивидуально или в группу'
    : 'Перейдите по ссылке-приглашению, чтобы начать заниматься с репетитором';

  return (
    <div
      className={cn(
        'bg-gray-0 flex w-[calc(100vw-var(--sidebar-width)-var(--lessons-panel-width)-48px)] flex-col gap-4 rounded-2xl p-4 transition-all duration-200 ease-linear',
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <h2 className="text-l-base font-medium text-gray-100">Учебные кабинеты</h2>
        <div className="ml-auto">
          {isTutor ? (
            <Button
              variant="icon"
              className="bg-brand-100 flex size-10 items-center justify-center rounded-full p-0"
              data-umami-event="invite-student-button"
              id="invite-student-button"
            >
              <Add className="fill-gray-0 size-5" />
            </Button>
          ) : (
            <Tooltip delayDuration={1000}>
              <TooltipTrigger asChild>
                <Button
                  variant="none"
                  className="flex size-8 items-center justify-center rounded-[4px] p-0"
                  onClick={handleMore}
                >
                  <ArrowRight className="fill-gray-60 size-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>К кабинетам</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {isLoading ? (
        <div
          className={
            isTutor
              ? 'flex h-[200px] w-full flex-row items-center justify-center'
              : 'flex h-[180px] w-full flex-row items-center justify-center'
          }
        >
          <p className="text-m-base text-gray-60">Загрузка...</p>
        </div>
      ) : filteredClassrooms && filteredClassrooms.length > 0 ? (
        <ScrollArea className="w-full" scrollBarProps={{ orientation: 'horizontal' }}>
          <div className="flex flex-row gap-3 pb-2">
            {!isHidden && <NoteForStudent onHide={hideNote} isTutor={isTutor} />}
            {filteredClassrooms.map((classroom) => (
              <div key={classroom.id} className="max-w-[320px] min-w-[320px] shrink-0">
                <Classroom classroom={classroom} isLoading={isLoading} />
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex h-[180px] w-full flex-row items-center justify-center">
          <p className="text-m-base text-gray-60 text-center">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};
