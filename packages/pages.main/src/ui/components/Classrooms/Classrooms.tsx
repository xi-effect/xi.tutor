import { Button } from '@xipkg/button';
import { ArrowRight } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { Classroom } from './Classroom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { useNavigate } from '@tanstack/react-router';
import { useCurrentUser } from 'common.services';

export const Classrooms = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

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
              variant="secondary"
              size="s"
              className="text-s-base border-gray-60 rounded-lg border px-4 py-2 font-medium text-gray-100 max-[550px]:hidden"
            >
              Создать группу
            </Button>

            <Button
              size="s"
              className="text-s-base text-gray-0 rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
            >
              Пригласить
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-row">
        <ScrollArea
          className="h-[122px] w-full overflow-x-auto overflow-y-hidden sm:w-[calc(100vw-104px)]"
          scrollBarProps={{ orientation: 'horizontal' }}
        >
          <div className="flex flex-row gap-8">
            {[...new Array(10)].map((_, index) => (
              <Classroom key={index} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
