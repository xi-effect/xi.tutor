import { Button } from '@xipkg/button';
import { ArrowRight, Group } from '@xipkg/icons';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { NextLesson } from './NextLesson';
import { AllLessons } from './AllLessons';

export const Lessons = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const handleMore = () => {
    // Сохраняем параметр call при переходе к календарю
    const filteredSearch = search.call ? { call: search.call } : {};

    navigate({
      to: '/calendar',
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        ...filteredSearch,
      }),
    });
  };

  return (
    <div className="bg-gray-0 flex flex-col gap-4 rounded-2xl p-4">
      <div className="flex flex-row items-center justify-start gap-2">
        <h2 className="text-xl-base font-medium text-gray-100">Расписание на сегодня</h2>
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
          <TooltipContent>К календарю</TooltipContent>
        </Tooltip>
        <div className="ml-auto">
          <Button
            variant="none"
            className="flex size-8 items-center justify-center rounded-[4px] p-0"
          >
            <Group className="fill-gray-60 size-6" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-m-base text-gray-80 font-medium">Ближайшее занятие</h3>
          <NextLesson />
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-m-base text-gray-80 font-medium">Все занятие</h3>
          <AllLessons />
        </div>
      </div>
    </div>
  );
};
