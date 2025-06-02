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
import { useTheme } from 'common.theme';

type ThemeT = 'light' | 'dark' | 'system';

export const Customization = () => {
  const isMobile = useMediaQuery('(max-width: 719px)');

  const { theme, setTheme } = useTheme();

  console.log('theme', theme);

  return (
    <>
      {!isMobile && <span className="text-3xl font-semibold">Персонализация</span>}
      <div className="border-gray-80 flex w-full flex-col rounded-2xl border p-1 sm:mt-4">
        <div className="flex w-full flex-col p-3">
          <span className="text-xl font-semibold">Внешний вид</span>
        </div>
        <div className="mt-2 flex w-full flex-col items-start justify-center gap-4 p-3 sm:flex-row sm:items-center">
          <div className="flex flex-row gap-4">
            <Palette className="fill-brand-80" />
            <span className="text-base leading-[24px] font-semibold">Тема оформления</span>
          </div>
          <Select value={theme} onValueChange={(value: ThemeT) => setTheme(value)}>
            <SelectTrigger className="ml-0 w-[250px] sm:ml-auto">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="light">Светлая</SelectItem>
                <SelectItem value="dark">Тёмная</SelectItem>
                <SelectItem value="system">Системная</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};
