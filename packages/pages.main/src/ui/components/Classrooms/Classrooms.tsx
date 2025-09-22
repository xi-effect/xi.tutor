/* eslint-disable no-irregular-whitespace */
import { Button } from '@xipkg/button';
import { ArrowRight, InfoCircle } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { Classroom } from './Classroom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { useNavigate } from '@tanstack/react-router';
import { ModalInvitation } from 'features.invites';
import { useCurrentUser, useFetchClassrooms } from 'common.services';
import { Alert, AlertIcon, AlertContainer, AlertDescription, AlertTitle } from '@xipkg/alert';

const NoteForUsers = () => {
  return (
    <Alert variant="brand">
      <AlertIcon>
        <InfoCircle className="fill-brand-100" />
      </AlertIcon>
      <AlertContainer className="h-full">
        <AlertTitle>Начать занятие</AlertTitle>
        <AlertDescription>
          Придумать текст(описание сценария на кнопку “Начать занятие”)
        </AlertDescription>
        <Button
          size="s"
          className="border-brand-100 text-brand-100 hover:bg-brand-100 hover:text-brand-0 mt-auto w-full border bg-transparent"
          variant="ghost"
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

  const navigate = useNavigate();

  const handleMore = () => {
    navigate({
      to: '/classrooms',
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
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
            <Button
              variant="ghost"
              size="s"
              className="text-s-base rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
            >
              Создать группу
            </Button>

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
        <NoteForUsers />
        {classrooms && classrooms?.length > 0 && (
          <ScrollArea
            className="h-[172px] w-full overflow-x-auto overflow-y-hidden"
            scrollBarProps={{ orientation: 'horizontal' }}
          >
            <div className="flex flex-row gap-8">
              {classrooms?.map((classroom) => (
                <Classroom key={classroom.id} classroom={classroom} isLoading={isLoading} />
              ))}
            </div>
          </ScrollArea>
        )}
        {classrooms && classrooms.length === 0 && (
          <div className="flex flex-row gap-8">
            <p className="text-m-base text-gray-60">
              Пригласите учеников — индивидуально или в группу
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
