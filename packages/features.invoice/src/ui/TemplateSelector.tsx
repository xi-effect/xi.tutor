/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { useTemplatesList } from 'common.services';
import { Control, useFieldArray } from '@xipkg/form';
import type { FormData } from '../model';

type TemplateSelectorProps = {
  control: Control<FormData>;
};

export const TemplateSelector = ({ control }: TemplateSelectorProps) => {
  const { data: templates, isLoading, isError } = useTemplatesList();

  const { append } = useFieldArray({
    control,
    name: 'items',
  });

  const handleTemplateSelect = (template: any) => {
    append({
      name: template.name,
      price: Number(template.price),
      quantity: 1,
    });
  };

  if (isLoading) {
    return (
      <Button
        className="bg-brand-0 hover:bg-brand-0 text-brand-100 hover:text-brand-80 h-[32px]"
        variant="ghost"
        size="s"
        type="button"
        disabled
      >
        Загрузка шаблонов...
      </Button>
    );
  }

  if (isError || !templates || templates.length === 0) {
    return (
      <Button
        className="bg-brand-0 hover:bg-brand-0 text-brand-100 hover:text-brand-80 h-[32px]"
        variant="ghost"
        size="s"
        type="button"
        disabled
      >
        Нет доступных шаблонов
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-[32px]" variant="secondary" size="s" type="button">
          Добавить занятие из шаблона
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[400px] p-2">
        {templates.map((template: any) => (
          <DropdownMenuItem
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className="hover:bg-gray-5 flex cursor-pointer flex-row gap-1 rounded-lg"
          >
            <div className="max-w-[300px] truncate font-medium text-gray-100">{template.name}</div>
            <div className="text-gray-60 ml-auto text-sm text-nowrap">{template.price} ₽</div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
