import { Button } from '@xipkg/button';
import { ArrowRight } from '@xipkg/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { useTranslation } from 'react-i18next';
import { EventItem } from './EventItem';
import { EventItemPropsT } from './types';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useMemo } from 'react';

export const Sidebar = () => {
  const { t } = useTranslation('main');
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const events: EventItemPropsT[] = useMemo(
    () => [
      {
        name: t('sidebar.mockStudentName'),
        description: 'Description',
        time: '17:40',
        color: 'brand',
      },
      {
        name: t('sidebar.mockStudentName'),
        description: t('sidebar.mockDescription'),
        time: '18:30',
        color: 'green',
      },
      {
        name: 'Event title',
        description: t('sidebar.mockDescription'),
        time: '19:20',
        color: 'green',
      },
      { name: 'Event title', description: 'Description', time: '20:10', color: 'brand' },
    ],
    [t],
  );

  const handleMore = () => {
    // Сохраняем параметр call при переходе на главную
    const filteredSearch = search.call ? { call: search.call } : {};

    navigate({
      to: '/',
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        ...filteredSearch,
      }),
    });
  };

  return (
    <div className="w-full shrink-0 flex-col justify-between gap-4 self-start px-4 pb-4 lg:mt-12 lg:flex lg:h-[calc(100vh-126px)] lg:w-[320px] 2xl:w-[430px]">
      <div className="lg:border-border-control flex h-full flex-col justify-start gap-4 rounded-2xl p-0 md:p-4 lg:border">
        <div className="flex flex-row items-center justify-start gap-2">
          <h2 className="text-xl-base text-text-primary font-medium">{t('sidebar.title')}</h2>
          <Tooltip delayDuration={1000}>
            <TooltipTrigger asChild>
              <Button
                variant="none"
                className="flex size-8 items-center justify-center rounded-[4px] p-0"
                onClick={handleMore}
              >
                <ArrowRight className="fill-icon-secondary size-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('sidebar.toSchedule')}</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex flex-col gap-2 overflow-auto">
          {events.length > 0 ? (
            events.map((item, index) => <EventItem {...item} key={index} />)
          ) : (
            <div className="flex justify-center p-8">
              <p className="text-l-base text-text-secondary text-center font-medium lg:text-base">
                {t('sidebar.empty')}
              </p>
            </div>
          )}
        </div>
        <div className="text-s-base mt-auto">
          <Button variant="ghost" size="s" className="w-full rounded-lg">
            {t('sidebar.openSchedule')}
          </Button>
        </div>
      </div>
    </div>
  );
};
