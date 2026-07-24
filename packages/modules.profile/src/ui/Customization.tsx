import { Badge } from '@xipkg/badge';
import { Calendar, Flag, Palette } from '@xipkg/icons';
import { useMediaQuery } from '@xipkg/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@xipkg/select';
import { Toggle } from '@xipkg/toggle';
import { useTheme, type ThemeItemT, type ThemeT } from 'common.theme';
import { useSupportModalStore } from 'common.ui';
import { setAppLanguage, normalizeAppLanguage, type AppLanguage } from 'common.ui/language';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

const SCHEDULE_VIEW_MODE_KEY = 'xi_schedule_view_mode';
const SCHEDULE_VIEW_MODE_CHANGE_EVENT = 'xi:schedule-view-mode-change';

const readScheduleViewMode = (): boolean => {
  try {
    return localStorage.getItem(SCHEDULE_VIEW_MODE_KEY) === 'full-week';
  } catch {
    return false;
  }
};

const ThemeOptionLabel = ({ item, label }: { item: ThemeItemT; label: string }) => (
  <span className="flex items-center gap-2">
    {label}
    {item.badge && (
      <Badge
        variant="default"
        className="bg-action-primary-background-pressed dark:bg-icon-brand inline-flex h-4 items-center rounded-full px-1.5 py-0 text-[8px] leading-none font-semibold text-white uppercase"
      >
        {item.badge}
      </Badge>
    )}
  </span>
);

export const Customization = () => {
  const { t, i18n } = useTranslation('profile');
  const isMobile = useMediaQuery('(max-width: 719px)');

  const { theme, setTheme, themes } = useTheme();
  const openSupportModal = useSupportModalStore((state) => state.open);
  const selectedTheme = themes.find((item) => item.value === theme);
  const language = normalizeAppLanguage(i18n.language);
  const themeLabel = (value: ThemeT) =>
    value === 'dark' ? t('customization.themeDark') : t('customization.themeLight');

  const [isFullWeek, setIsFullWeekState] = useState<boolean>(readScheduleViewMode);

  const handleFullWeekToggle = useCallback((checked: boolean) => {
    try {
      localStorage.setItem(SCHEDULE_VIEW_MODE_KEY, checked ? 'full-week' : 'auto');
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent(SCHEDULE_VIEW_MODE_CHANGE_EVENT));
    setIsFullWeekState(checked);
  }, []);

  return (
    <>
      {!isMobile && (
        <span className="dark:text-text-primary text-3xl font-semibold">
          {t('customization.title')}
        </span>
      )}
      <div className="border-border-strong mt-4 flex w-full flex-col rounded-2xl border p-1">
        <div className="flex w-full flex-col p-3">
          <span className="dark:text-text-primary text-xl font-semibold">
            {t('customization.appearance')}
          </span>
        </div>
        <div className="mt-2 flex w-full flex-col gap-3 p-3">
          <div className="flex w-full flex-col items-start justify-center gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-row gap-4">
              <Palette className="fill-icon-brand" />
              <span className="dark:text-text-primary text-base leading-[24px] font-semibold">
                {t('customization.theme')}
              </span>
            </div>
            <Select value={theme} onValueChange={(value: ThemeT) => setTheme(value)}>
              <SelectTrigger className="dark:text-text-primary ml-0 w-[250px] sm:ml-auto">
                <SelectValue placeholder={t('customization.themePlaceholder')}>
                  {selectedTheme ? (
                    <ThemeOptionLabel
                      item={selectedTheme}
                      label={themeLabel(selectedTheme.value)}
                    />
                  ) : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {themes.map((themeItem) => {
                    const label = themeLabel(themeItem.value);
                    return (
                      <SelectItem
                        key={themeItem.value}
                        value={themeItem.value}
                        textValue={themeItem.badge ? `${label} ${themeItem.badge}` : label}
                        className="dark:text-text-primary"
                      >
                        <ThemeOptionLabel item={themeItem} label={label} />
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-full flex-col items-start justify-center gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-row gap-4">
              <Flag className="fill-icon-brand" />
              <span className="dark:text-text-primary text-base leading-[24px] font-semibold">
                {t('customization.language')}
              </span>
            </div>
            <Select
              value={language}
              onValueChange={(value: AppLanguage) => {
                void setAppLanguage(value);
              }}
            >
              <SelectTrigger className="dark:text-text-primary ml-0 w-[250px] sm:ml-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ru" className="dark:text-text-primary">
                    {t('customization.languageRu')}
                  </SelectItem>
                  <SelectItem value="en" className="dark:text-text-primary">
                    {t('customization.languageEn')}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <p className="text-text-secondary text-s-base max-w-[560px]">
            {t('customization.themeBetaNote')}{' '}
            <button
              type="button"
              onClick={openSupportModal}
              className="text-text-link hover:text-text-link font-inherit inline cursor-pointer border-0 bg-transparent p-0 hover:underline"
            >
              {t('customization.support')}
            </button>
            .
          </p>
        </div>
      </div>

      {!isMobile && (
        <div className="border-border-strong mt-4 flex w-full flex-col rounded-2xl border p-1">
          <div className="flex w-full flex-col p-3">
            <span className="dark:text-text-primary text-xl font-semibold">
              {t('customization.schedule')}
            </span>
          </div>
          <div className="mt-2 flex w-full flex-col gap-3 p-3">
            <div className="flex w-full flex-row items-center justify-between gap-4">
              <div className="flex flex-row gap-4">
                <Calendar className="fill-icon-brand" />
                <div className="flex flex-col gap-0.5">
                  <span className="dark:text-text-primary text-base leading-[24px] font-semibold">
                    {t('customization.showAllDays')}
                  </span>
                  <span className="text-text-secondary text-s-base">
                    {t('customization.showAllDaysHint')}
                  </span>
                </div>
              </div>
              <Toggle
                checked={isFullWeek}
                size="s"
                onCheckedChange={handleFullWeekToggle}
                className="shrink-0"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
