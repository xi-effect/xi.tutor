import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from '@xipkg/icons';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@xipkg/select';
import {
  formatGmtOffset,
  getDateLocale,
  getTimeZoneCityLabel,
  isAppTimeZoneAutomatic,
  listAppTimeZones,
  PINNED_TIME_ZONES,
  setAppTimeZone,
  useAppTimeZone,
} from 'common.ui';
import { SettingsGroup, settingsRowTitleClass } from '../layout/SettingsGroup';

const AUTO_VALUE = 'system';

export const TimeZonePicker = () => {
  const { t, i18n } = useTranslation('profile');
  const timeZone = useAppTimeZone();
  const automatic = isAppTimeZoneAutomatic();
  const locale = getDateLocale(i18n.language);

  const options = useMemo(() => {
    const listed = listAppTimeZones();
    const zones = !automatic && !listed.includes(timeZone) ? [...listed, timeZone] : listed;
    const pinned = PINNED_TIME_ZONES.filter((zone) => zones.includes(zone));
    const pinnedSet = new Set<string>(pinned);
    const toOption = (zone: string) => ({
      value: zone,
      label: `${getTimeZoneCityLabel(zone, locale)}, ${formatGmtOffset(zone)}`,
    });
    return {
      pinned: pinned.map(toOption),
      rest: zones.filter((zone) => !pinnedSet.has(zone)).map(toOption),
    };
  }, [automatic, locale, timeZone]);

  return (
    <SettingsGroup title={t('schedule.timezone')}>
      <div className="flex w-full flex-col items-start justify-center gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-row gap-4">
          <Clock className="fill-icon-brand shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className={settingsRowTitleClass}>{t('schedule.timezone')}</span>
            <span className="text-text-secondary text-s-base">{t('schedule.timezoneHint')}</span>
          </div>
        </div>
        <Select
          value={automatic ? AUTO_VALUE : timeZone}
          onValueChange={(value) => {
            setAppTimeZone(value === AUTO_VALUE ? null : value);
          }}
        >
          <SelectTrigger
            className="dark:text-text-primary ml-0 w-full sm:ml-auto sm:w-[280px]"
            data-umami-event="profile-timezone"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[min(320px,var(--radix-select-content-available-height))]">
            <SelectGroup>
              <SelectItem value={AUTO_VALUE} className="dark:text-text-primary">
                {t('schedule.timezoneAuto')}
              </SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              {options.pinned.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  textValue={option.label}
                  className="dark:text-text-primary"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              {options.rest.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  textValue={option.label}
                  className="dark:text-text-primary"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </SettingsGroup>
  );
};
