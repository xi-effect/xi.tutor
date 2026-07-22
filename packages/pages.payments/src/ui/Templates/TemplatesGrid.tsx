import { useRef } from 'react';
import { TemplateCard } from './TemplateCard';
import { useTemplatesList } from 'common.services';
import { useDeleteTemplate } from 'common.services';
import { AddTemplateButton } from './AddTemplateButton';
import { GridVirtualizer } from '@xipkg/gridvirtualizer';
import { cn, useMediaQuery } from '@xipkg/utils';
import { TemplateT } from 'common.types';

export const TemplatesGrid = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 960px)');

  const { data: items, isError, isLoading } = useTemplatesList();
  const { mutate: deleteTemplateMutation } = useDeleteTemplate();

  const handleDeleteTemplate = (id: number) => () => {
    deleteTemplateMutation(id);
  };

  if (isLoading) {
    <div className="flex h-64 items-center justify-center">
      <div className="text-red-500">Загрузка...</div>
    </div>;
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">Ошибка загрузки шаблонов</p>
      </div>
    );
  }

  const itemsWithButton = !items
    ? [{ id: 0, name: 'createTemplateButton' }]
    : [...items, { id: 0, name: 'createTemplateButton' }];

  return (
    <div
      className={cn(
        'min-h-0 flex-1 overflow-auto pr-4 pl-5',
        isMobile && 'h-[calc(100dvh-224px)]',
        !isMobile && 'h-[calc(100dvh-120px)]',
      )}
    >
      <div ref={parentRef}>
        <GridVirtualizer
          parentRef={parentRef}
          items={itemsWithButton}
          defaultRowHeight={100}
          minItemWidth={300}
          gap={20}
          maxColumns={4}
          isSingleColumn={isMobile}
          renderItem={(item: TemplateT) =>
            item.id === 0 ? (
              <AddTemplateButton />
            ) : (
              <TemplateCard {...item} handleDeleteTemplate={handleDeleteTemplate} />
            )
          }
        />

        {!items?.length && (
          <div className="flex h-64 items-center justify-center">
            <p className="text-s-base text-gray-60 dark:text-gray-50">
              Шаблоны не загружены или еще не созданы
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
