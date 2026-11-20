import { Calendar, Clock } from '@xipkg/icons';
import { Toggle } from '@xipkg/toggle';
import { useMediaQuery } from '@xipkg/utils';
import { useCurrentUser } from 'common.services';
import { useScheduleWorkingHours, useTypicalLessonDuration } from 'common.ui';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LessonDurationPicker } from './LessonDurationPicker';
import { TimeZonePicker } from './TimeZonePicker';
import { WorkingHoursTimePicker } from './WorkingHoursTimePicker';
import { SettingsGroup, settingsRowTitleClass } from '../layout/SettingsGroup';

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
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const { workingHours, setWorkingHours } = useScheduleWorkingHours();
  const { durationMinutes, setDurationMinutes } = useTypicalLessonDuration();

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
      <TimeZonePicker />

      {!isMobile && (
        <SettingsGroup title={t('schedule.view')}>
          <div className="flex w-full flex-row items-center justify-between gap-4">
            <div className="flex min-w-0 flex-row gap-4">
              <Calendar className="fill-icon-brand shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className={settingsRowTitleClass}>{t('schedule.showAllDays')}</span>
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
        </SettingsGroup>
      )}

      <SettingsGroup title={t('schedule.workingHours')}>
        <div className="flex w-full flex-col items-start justify-center gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-row gap-4">
            <Clock className="fill-icon-brand shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className={settingsRowTitleClass}>{t('schedule.period')}</span>
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
      </SettingsGroup>

      {isTutor ? (
        <SettingsGroup title={t('schedule.lessonDuration')}>
          <div className="flex w-full flex-col items-start justify-center gap-4 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-row gap-4">
              <Clock className="fill-icon-brand shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className={settingsRowTitleClass}>{t('schedule.typicalDuration')}</span>
                <span className="text-text-secondary text-s-base">
                  {t('schedule.lessonDurationHint')}
                </span>
              </div>
            </div>
            <div className="flex w-full flex-row items-center gap-2 sm:ml-auto sm:w-auto">
              <LessonDurationPicker
                valueMinutes={durationMinutes}
                onChange={setDurationMinutes}
                data-umami-event="profile-schedule-typical-duration"
              />
            </div>
          </div>
        </SettingsGroup>
      ) : null}
    </>
  );
};
