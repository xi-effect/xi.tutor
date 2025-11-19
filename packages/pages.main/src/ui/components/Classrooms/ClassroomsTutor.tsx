import { Button } from '@xipkg/button';
import { ArrowRight } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { Classroom } from './Classroom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { useNavigate } from '@tanstack/react-router';
import { ModalInvitation } from 'features.invites';
import { useFetchClassrooms } from 'common.services';
import { ModalAddGroup } from 'features.group.add';
import { useNoteVisibility } from '../../../hooks';
import { NoteForStudent } from './NoteForStudent';

export const ClassroomsTutor = () => {
  const { data: classrooms, isLoading } = useFetchClassrooms();
  const { isHidden, hideNote } = useNoteVisibility(true);

  const navigate = useNavigate();

  const handleMore = () => {
    navigate({
      to: '/classrooms',
    });
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-1 pb-1">
      <div className="flex flex-row items-center justify-start gap-2">
        <h2 className="text-xl-base font-medium text-gray-100">Кабинеты</h2>
        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 items-center justify-center rounded-sm p-0"
              onClick={handleMore}
            >
              <ArrowRight className="fill-gray-60 size-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>К кабинетам</TooltipContent>
        </Tooltip>

        <div className="ml-auto flex flex-row items-center gap-2 max-sm:hidden">
          <ModalAddGroup>
            <Button
              id="create-group-button"
              variant="ghost"
              size="s"
              className="text-s-base rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
            >
              Создать группу
            </Button>
          </ModalAddGroup>

          <ModalInvitation>
            <Button
              id="invite-student-button"
              size="s"
              variant="secondary"
              className="rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
            >
              Пригласить
            </Button>
          </ModalInvitation>
        </div>
      </div>

      <div className="flex flex-row gap-8">
        {classrooms && classrooms?.length > 0 && (
          <ScrollArea className="h-[180px] w-full" scrollBarProps={{ orientation: 'horizontal' }}>
            <div className="flex flex-row gap-8">
              {!isHidden && classrooms && classrooms?.length > 0 && (
                <NoteForStudent onHide={hideNote} isTutor={true} />
              )}
              {classrooms?.map((classroom) => (
                <Classroom key={classroom.id} classroom={classroom} isLoading={isLoading} />
              ))}
            </div>
          </ScrollArea>
        )}
        {classrooms && classrooms.length === 0 && (
          <div className="flex h-[180px] w-full flex-row items-center justify-center gap-8">
            <p className="text-m-base text-gray-60 text-center">
              Пригласите учеников — индивидуально или в группу
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
