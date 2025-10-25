import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from '@xipkg/dropdown';
import { Button } from '@xipkg/button';
import { TypeWorkT } from './CardMaterials';
import { MoreVert } from '@xipkg/icons';
//import { cn } from '@xipkg/utils';

const options: { value: TypeWorkT; label: string }[] = [
  { value: 'only_tutor', label: 'только репетитор' },
  { value: 'draft', label: 'черновик' },
  { value: 'collaboration', label: 'совместная работа' },
];

export const DropdownButton = ({ accessType }: { accessType: TypeWorkT }) => {
  const [selected, setSelected] = useState<TypeWorkT | null>(accessType ?? null);

  const handleChange = (key: TypeWorkT) => {
    setSelected(key);
  };

  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="h-8 w-8" variant="ghost" size="icon">
            <MoreVert className="h-4 w-4 dark:fill-gray-100" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="bottom"
          align="end"
          className="border-gray-10 bg-gray-0 text-xs-base w-[182px] rounded-lg border p-2 font-normal"
        >
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>поменять доступ</DropdownMenuSubTrigger>

            <DropdownMenuSubContent
              sideOffset={12}
              className="border-gray-10 bg-gray-0 text-xs-base mt-2 rounded-lg border p-2 font-normal"
            >
              {options.map(({ value, label }) => (
                <DropdownMenuCheckboxItem
                  key={value}
                  checked={selected === value}
                  onCheckedChange={() => handleChange(value)}
                  className="hover:bg-brand-0 hover:text-brand-100 relative flex w-full flex-row-reverse items-center justify-start gap-2 px-2 py-[6px] hover:rounded-lg [&>span.absolute]:static [&>span.absolute]:left-auto [&>span.absolute]:ml-2 [&>span>svg]:relative [&>span>svg]:top-[1px]"
                >
                  <div className="w-full text-left">{label}</div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem className="hover:bg-brand-0 hover:text-brand-100 w-full px-2 py-[6px] hover:rounded-lg">
            редактировать
          </DropdownMenuItem>

          <DropdownMenuItem className="hover:bg-brand-0 hover:text-brand-100 w-full px-2 py-[6px] hover:rounded-lg">
            удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
