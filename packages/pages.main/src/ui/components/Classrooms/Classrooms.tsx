/* eslint-disable no-irregular-whitespace */
import { Button } from '@xipkg/button';
import { ArrowRight, InfoCircle } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { Classroom } from './Classroom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { useNavigate } from '@tanstack/react-router';
import { ModalInvitation } from 'features.invites';
import { useCurrentUser, useFetchClassrooms } from 'common.services';
import { ModalAddGroup } from 'features.group.add';
import { Alert, AlertIcon, AlertContainer, AlertDescription, AlertTitle } from '@xipkg/alert';
import { useNoteVisibility } from '../../../hooks';

const NoteForUsers = ({ onHide, isTutor }: { onHide: () => void; isTutor: boolean }) => {
  return (
    <Alert className="h-[170px] max-w-[320px] min-w-[320px]" variant="brand">
      <AlertIcon>
        <InfoCircle className="fill-brand-100" />
      </AlertIcon>
      <AlertContainer className="h-full">
        <AlertTitle> {isTutor ? 'Как начать занятие' : 'Подсказка'} </AlertTitle>
        <AlertDescription>
          {isTutor
            ? 'Нажмите «Начать занятие», чтобы перейти в видеозвонок. Ученик получит уведомление'
            : 'Когда репетитор начнёт занятие, кнопка «Присоединиться» станет активной'}
        </AlertDescription>
        <Button
          size="s"
          className="border-brand-100 text-brand-100 hover:bg-brand-100 hover:text-brand-0 mt-auto w-full border bg-transparent"
          variant="ghost"
          onClick={onHide}
        >
          Скрыть
        </Button>
      </AlertContainer>
    </Alert>
  );
};

export const Classrooms = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const { data: classrooms, isLoading } = useFetchClassrooms();
  const { isHidden, hideNote } = useNoteVisibility();

  const navigate = useNavigate();

  const handleMore = () => {
    navigate({
      to: '/classrooms',
    });
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-1">
      <div className="flex flex-row items-center justify-start gap-2">
        <h2 className="text-xl-base font-medium text-gray-100">Кабинеты</h2>
        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 items-center justify-center rounded-[4px] p-0"
              onClick={handleMore}
            >
              <ArrowRight className="fill-gray-60 size-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>К кабинетам</TooltipContent>
        </Tooltip>

        {isTutor && (
          <div className="ml-auto flex flex-row items-center gap-2 max-sm:hidden">
            <ModalAddGroup>
              <Button
                variant="ghost"
                size="s"
                className="text-s-base rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
              >
                Создать группу
              </Button>
            </ModalAddGroup>

            <ModalInvitation>
              <Button
                size="s"
                variant="secondary"
                className="rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
              >
                Пригласить
              </Button>
            </ModalInvitation>
          </div>
        )}
      </div>

      <div className="flex flex-row gap-8">
        {classrooms && classrooms?.length > 0 && (
          <ScrollArea className="h-[180px] w-full" scrollBarProps={{ orientation: 'horizontal' }}>
            <div className="flex flex-row gap-8">
              {!isHidden && classrooms && classrooms?.length > 0 && (
                <NoteForUsers onHide={hideNote} isTutor={isTutor} />
              )}
              {classrooms?.map((classroom) => (
                <Classroom key={classroom.id} classroom={classroom} isLoading={isLoading} />
              ))}
            </div>
          </ScrollArea>
        )}
        {classrooms && classrooms.length === 0 && (
          <div className="flex h-[180px] w-full flex-row items-center justify-center gap-8">
            <p className="text-m-base lg:text-xl-base text-gray-60 text-center">
              {isTutor
                ? 'Пригласите учеников — индивидуально или в группу'
                : 'Перейдите по ссылке-приглашению, чтобы начать заниматься с репетитором'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
