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
import { useTheme, type ThemeT } from 'common.theme';

export const Customization = () => {
  const isMobile = useMediaQuery('(max-width: 719px)');

  const { theme, setTheme, themes } = useTheme();

  return (
    <>
      {!isMobile && (
        <span className="text-3xl font-semibold dark:text-gray-100">Персонализация</span>
      )}
      <div className="border-gray-80 mt-4 flex w-full flex-col rounded-2xl border p-1">
        <div className="flex w-full flex-col p-3">
          <span className="text-xl font-semibold dark:text-gray-100">Внешний вид</span>
        </div>
        <div className="mt-2 flex w-full flex-col items-start justify-center gap-4 p-3 sm:flex-row sm:items-center">
          <div className="flex flex-row gap-4">
            <Palette className="fill-brand-80" />
            <span className="text-base leading-[24px] font-semibold dark:text-gray-100">
              Тема оформления
            </span>
          </div>
          <Select value={theme} onValueChange={(value: ThemeT) => setTheme(value)}>
            <SelectTrigger className="ml-0 w-[250px] sm:ml-auto dark:text-gray-100">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {themes.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value} className="dark:text-gray-100">
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};
