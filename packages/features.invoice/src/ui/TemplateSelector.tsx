/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Control, useFieldArray } from '@xipkg/form';
import { useMediaQuery } from '@xipkg/utils';
import { useTemplatesList } from 'common.services';
import { generateRandomId } from '../utils';
import type { FormData, FormInput } from '../model';

type TemplateSelectorProps = {
  control: Control<FormInput, unknown, FormData>;
};

export const TemplateSelector = ({ control }: TemplateSelectorProps) => {
  const isMobile = useMediaQuery('(max-width: 500px)');

  const { data: templates, isLoading, isError } = useTemplatesList();

  const { append } = useFieldArray({
    control,
    name: 'items',
  });

  const handleTemplateSelect = (template: any) => {
    append({
      id: generateRandomId(),
      name: template.name,
      price: Number(template.price),
      quantity: 1,
    });
  };

  if (isLoading) {
    return (
      <Button
        className="bg-status-info-background hover:bg-status-info-background text-text-link hover:text-text-link h-[32px]"
        variant="none"
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
        className="bg-status-info-background hover:bg-status-info-background text-text-link hover:text-text-link h-[32px]"
        variant="none"
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
        <Button className="h-[32px]" variant="ghost" size="s" type="button">
          Добавить занятие из шаблона
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={`${isMobile ? 'w-[300px]' : 'w-[400px]'} p-2`}>
        {templates.map((template: any) => (
          <DropdownMenuItem
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className="hover:bg-background-page flex cursor-pointer flex-row gap-1 rounded-lg"
          >
            <div className="text-text-primary max-w-[300px] truncate font-medium">
              {template.name}
            </div>
            <div className="text-text-secondary ml-auto text-sm text-nowrap">
              {template.price} ₽
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
