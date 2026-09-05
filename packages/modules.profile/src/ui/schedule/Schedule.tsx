import { Calendar, Clock } from '@xipkg/icons';
import { Toggle } from '@xipkg/toggle';
import { useMediaQuery } from '@xipkg/utils';
import { useScheduleWorkingHours } from 'common.ui';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkingHoursTimePicker } from './WorkingHoursTimePicker';

const SCHEDULE_VIEW_MODE_KEY = 'xi_schedule_view_mode';
const SCHEDULE_VIEW_MODE_CHANGE_EVENT = 'xi:schedule-view-mode-change';

const readScheduleViewMode = (): boolean => {
  try {
    return localStorage.getItem(SCHEDULE_VIEW_MODE_KEY) === 'full-week';
  } catch {
    return false;
  }
};

export const Schedule = () => {
  const { t } = useTranslation('profile');
  const isMobile = useMediaQuery('(max-width: 719px)');
  const [isFullWeek, setIsFullWeekState] = useState<boolean>(readScheduleViewMode);
  const { workingHours, setWorkingHours } = useScheduleWorkingHours();

  const handleFullWeekToggle = useCallback((checked: boolean) => {
    try {
      localStorage.setItem(SCHEDULE_VIEW_MODE_KEY, checked ? 'full-week' : 'auto');
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent(SCHEDULE_VIEW_MODE_CHANGE_EVENT));
    setIsFullWeekState(checked);
  }, []);

  const handleFromChange = useCallback(
    (from: string) => {
      setWorkingHours({ ...workingHours, from });
    },
    [setWorkingHours, workingHours],
  );

  const handleToChange = useCallback(
    (to: string) => {
      setWorkingHours({ ...workingHours, to });
    },
    [setWorkingHours, workingHours],
  );

  return (
    <>
      {!isMobile && (
        <span className="dark:text-text-primary text-3xl font-semibold">{t('schedule.title')}</span>
      )}

      {!isMobile && (
        <div className="border-border-strong mt-4 flex w-full flex-col rounded-2xl border p-1">
          <div className="flex w-full flex-col p-3">
            <span className="dark:text-text-primary text-xl font-semibold">
              {t('schedule.view')}
            </span>
          </div>
          <div className="mt-2 flex w-full flex-col gap-3 p-3">
            <div className="flex w-full flex-row items-center justify-between gap-4">
              <div className="flex flex-row gap-4">
                <Calendar className="fill-icon-brand" />
                <div className="flex flex-col gap-0.5">
                  <span className="dark:text-text-primary text-base leading-6 font-semibold">
                    {t('schedule.showAllDays')}
                  </span>
                  <span className="text-text-secondary text-s-base">
                    {t('schedule.showAllDaysHint')}
                  </span>
                </div>
              </div>
              <Toggle
                checked={isFullWeek}
                size="s"
                onCheckedChange={handleFullWeekToggle}
                className="shrink-0"
                data-umami-event="profile-schedule-full-week"
                data-umami-event-state={isFullWeek ? 'on' : 'off'}
              />
            </div>
          </div>
        </div>
      )}

      <div className="border-border-strong mt-4 flex w-full flex-col rounded-2xl border p-1">
        <div className="flex w-full flex-col p-3">
          <span className="dark:text-text-primary text-xl font-semibold">
            {t('schedule.workingHours')}
          </span>
        </div>
        <div className="mt-2 flex w-full flex-col gap-3 p-3">
          <div className="flex w-full flex-col items-start justify-center gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-row gap-4">
              <Clock className="fill-icon-brand shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="dark:text-text-primary text-base leading-6 font-semibold">
                  {t('schedule.period')}
                </span>
                <span className="text-text-secondary text-s-base">{t('schedule.periodHint')}</span>
              </div>
            </div>
            <div className="flex w-full flex-row items-center gap-2 sm:ml-auto sm:w-auto">
              <WorkingHoursTimePicker
                value={workingHours.from}
                onChange={handleFromChange}
                maxExclusive={workingHours.to}
                data-umami-event="profile-schedule-working-hours-from"
              />
              <span className="text-text-secondary shrink-0">—</span>
              <WorkingHoursTimePicker
                value={workingHours.to}
                onChange={handleToChange}
                minExclusive={workingHours.from}
                data-umami-event="profile-schedule-working-hours-to"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
