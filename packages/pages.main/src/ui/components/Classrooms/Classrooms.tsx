import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Add, ArrowRight, Group, UserPlus } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { useNavigate } from '@tanstack/react-router';
import { useCurrentUser, useFetchClassrooms, useFetchClassroomsByStudent } from 'common.services';
import { useState, useMemo } from 'react';
import { ModalAddGroup } from 'features.group.add';
import { ModalInvitation } from 'features.invites';
import { EmptyClassrooms } from 'common.ui';
import { Classroom } from './Classroom';
import { SectionEmptyState, sectionEmptyStateIllustrationClass } from '../SectionEmptyState';
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

  const [selectedSubject] = useState<string>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [addGroupModalOpen, setAddGroupModalOpen] = useState(false);
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

  const inviteEmptyButtonClass =
    'bg-brand-0 hover:bg-brand-20/50 active:bg-brand-20/50 text-xs-base flex h-8 items-center gap-2 rounded-lg border-transparent px-4 font-medium text-brand-100';

  return (
    <div
      className={cn(
        'bg-gray-0 flex w-full flex-col gap-4 rounded-2xl px-5 pt-4 pb-1 transition-all duration-200 ease-linear sm:w-[calc(100vw-var(--sidebar-width)-var(--lessons-panel-width)-48px)]',
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <h2 className="text-l-base font-medium text-gray-100">Кабинеты</h2>
        <div className="ml-auto">
          {isTutor ? (
            <>
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="none"
                    className="bg-brand-0 hover:bg-brand-20/50 active:bg-brand-20/50 flex h-8 w-10 items-center justify-center rounded-lg p-0"
                    data-umami-event="invite-student-button"
                    id="invite-student-button"
                  >
                    <Add className="fill-brand-80 size-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="bottom"
                  className="border-gray-10 bg-gray-0 flex w-[320px] flex-col gap-2.5 rounded-2xl border px-6 py-5 shadow-lg"
                >
                  <DropdownMenuLabel className="text-m-base p-0 font-medium text-gray-100">
                    Добавить
                  </DropdownMenuLabel>
                  <div className="flex flex-col gap-3">
                    <DropdownMenuItem
                      className="border-gray-10 bg-gray-0 focus:bg-gray-0 data-highlighted:bg-gray-5 flex h-9 w-[272px] cursor-pointer flex-row items-center gap-2 rounded-lg border p-2 px-3 focus:outline-none"
                      onSelect={() => {
                        setDropdownOpen(false);
                        setInviteModalOpen(true);
                      }}
                      data-umami-event="classrooms-add-student"
                    >
                      <UserPlus className="fill-gray-80 size-4 shrink-0" />
                      <span className="text-s-base text-gray-80 flex-1 text-left font-medium">
                        Ученика
                      </span>
                      <Add className="fill-brand-80 size-4 shrink-0" />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="border-gray-10 bg-gray-0 focus:bg-gray-0 data-highlighted:bg-gray-5 flex h-9 w-[272px] cursor-pointer flex-row items-center gap-2 rounded-lg border p-2 px-3 focus:outline-none"
                      onSelect={() => {
                        setDropdownOpen(false);
                        setAddGroupModalOpen(true);
                      }}
                      data-umami-event="classrooms-add-group"
                    >
                      <Group className="fill-gray-80 size-4 shrink-0" />
                      <span className="text-s-base text-gray-80 flex-1 text-left font-medium">
                        Учебную группу
                      </span>
                      <Add className="fill-brand-80 size-4 shrink-0" />
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <ModalInvitation open={inviteModalOpen} onOpenChange={setInviteModalOpen} />
              <ModalAddGroup open={addGroupModalOpen} onOpenChange={setAddGroupModalOpen} />
            </>
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
        <div className={'flex h-[152px] w-full flex-row items-center justify-center'}>
          <p className="text-m-base text-gray-60">Загрузка...</p>
        </div>
      ) : filteredClassrooms && filteredClassrooms.length > 0 ? (
        <ScrollArea className="w-full" scrollBarProps={{ orientation: 'horizontal' }}>
          <div className="flex flex-row gap-3 pb-3">
            {filteredClassrooms.map((classroom) => (
              <div key={classroom.id} className="w-[240px] shrink-0 xl:w-[280px]">
                <Classroom classroom={classroom} isLoading={isLoading} />
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : isTutor && selectedSubject === 'all' ? (
        <SectionEmptyState
          title="У вас нет кабинетов"
          description="Вы можете создать кабинет для групповых или индивидуальных занятий"
          minHeightClass="min-h-[160px] sm:min-h-[180px]"
          illustration={<EmptyClassrooms className={sectionEmptyStateIllustrationClass} />}
          actions={
            <Button
              type="button"
              variant="none"
              className={inviteEmptyButtonClass}
              onClick={() => setInviteModalOpen(true)}
              data-umami-event="classrooms-empty-invite"
            >
              Пригласить ученика
              <UserPlus className="text-brand-100 size-4 shrink-0" />
            </Button>
          }
        />
      ) : (
        <SectionEmptyState title={emptyMessage} minHeightClass="min-h-[152px]" />
      )}
    </div>
  );
};
