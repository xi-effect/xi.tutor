import { Badge } from '@xipkg/badge';
import { Palette } from '@xipkg/icons';
import { useMediaQuery } from '@xipkg/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@xipkg/select';
import { useTheme, type ThemeItemT, type ThemeT } from 'common.theme';
import { useSupportModalStore } from 'common.ui';

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
    </>
  );
};
