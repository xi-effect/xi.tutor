import { Badge } from '@xipkg/badge';
import { Calendar, Palette } from '@xipkg/icons';
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
import { useCallback, useState } from 'react';

const SCHEDULE_VIEW_MODE_KEY = 'xi_schedule_view_mode';
const SCHEDULE_VIEW_MODE_CHANGE_EVENT = 'xi:schedule-view-mode-change';

const readScheduleViewMode = (): boolean => {
  try {
    return localStorage.getItem(SCHEDULE_VIEW_MODE_KEY) === 'full-week';
  } catch {
    return false;
  }
};

const ThemeOptionLabel = ({ item }: { item: ThemeItemT }) => (
  <span className="flex items-center gap-2">
    {item.label}
    {item.badge && (
      <Badge
        variant="default"
        className="bg-brand-100 dark:bg-brand-40 inline-flex h-4 items-center rounded-full px-1.5 py-0 text-[8px] leading-none font-semibold text-white uppercase"
      >
        {item.badge}
      </Badge>
    )}
  </span>
);

export const Customization = () => {
  const isMobile = useMediaQuery('(max-width: 719px)');

  const { theme, setTheme, themes } = useTheme();
  const openSupportModal = useSupportModalStore((state) => state.open);
  const selectedTheme = themes.find((item) => item.value === theme);

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
        <span className="text-3xl font-semibold dark:text-gray-100">Персонализация</span>
      )}
      <div className="border-gray-80 mt-4 flex w-full flex-col rounded-2xl border p-1">
        <div className="flex w-full flex-col p-3">
          <span className="text-xl font-semibold dark:text-gray-100">Внешний вид</span>
        </div>
        <div className="mt-2 flex w-full flex-col gap-3 p-3">
          <div className="flex w-full flex-col items-start justify-center gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-row gap-4">
              <Palette className="fill-brand-80" />
              <span className="text-base leading-[24px] font-semibold dark:text-gray-100">
                Тема оформления
              </span>
            </div>
            <Select value={theme} onValueChange={(value: ThemeT) => setTheme(value)}>
              <SelectTrigger className="ml-0 w-[250px] sm:ml-auto dark:text-gray-100">
                <SelectValue placeholder="Выберите тему">
                  {selectedTheme ? <ThemeOptionLabel item={selectedTheme} /> : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {themes.map((themeItem) => (
                    <SelectItem
                      key={themeItem.value}
                      value={themeItem.value}
                      textValue={
                        themeItem.badge ? `${themeItem.label} ${themeItem.badge}` : themeItem.label
                      }
                      className="dark:text-gray-100"
                    >
                      <ThemeOptionLabel item={themeItem} />
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <p className="text-gray-60 text-s-base max-w-[560px]">
            Тёмная тема находится в режиме beta. При её использовании отдельные элементы интерфейса
            могут отображаться некорректно. Если вы заметили проблему — напишите в{' '}
            <button
              type="button"
              onClick={openSupportModal}
              className="text-brand-80 hover:text-brand-100 font-inherit inline cursor-pointer border-0 bg-transparent p-0 hover:underline"
            >
              поддержку
            </button>
            .
          </p>
        </div>
      </div>

      {!isMobile && (
        <div className="border-gray-80 mt-4 flex w-full flex-col rounded-2xl border p-1">
          <div className="flex w-full flex-col p-3">
            <span className="text-xl font-semibold dark:text-gray-100">Расписание</span>
          </div>
          <div className="mt-2 flex w-full flex-col gap-3 p-3">
            <div className="flex w-full flex-row items-center justify-between gap-4">
              <div className="flex flex-row gap-4">
                <Calendar className="fill-brand-80" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-base leading-[24px] font-semibold dark:text-gray-100">
                    Показывать все 7 дней
                  </span>
                  <span className="text-gray-60 text-s-base">
                    Все дни недели (Пн–Вс) с горизонтальной прокруткой
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
