import { Button } from '@xipkg/button';
import { ArrowRight } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { MaterialsAdd } from 'features.materials.add';
import { useGetMaterialsList } from 'common.services';
import { Material } from './Material';

export const Materials = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const { data: materials, isLoading } = useGetMaterialsList({
    content_type: null, // null означает все типы материалов
  });

  const handleMore = () => {
    // Сохраняем параметр call при переходе к материалам
    const filteredSearch = search.call ? { call: search.call } : {};

    navigate({
      to: '/materials',
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        ...filteredSearch,
      }),
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-row items-center justify-start gap-2">
        <h2 className="text-xl-base font-medium text-gray-100">Материалы</h2>
        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 items-center justify-center rounded-[4px] p-0"
              onClick={handleMore}
            >
              <ArrowRight className="fill-gray-60 size-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>К материалам</TooltipContent>
        </Tooltip>

        <MaterialsAdd onlyDrafts />
      </div>
      <div className="flex flex-row">
        {materials && materials.length > 0 && (
          <ScrollArea
            className="h-[110px] w-full sm:w-[calc(100vw-104px)]"
            scrollBarProps={{ orientation: 'horizontal' }}
          >
            <div className="flex flex-row gap-8">
              {materials.map((material) => (
                <Material key={material.id} material={material} isLoading={isLoading} />
              ))}
            </div>
          </ScrollArea>
        )}
        {materials && materials.length === 0 && (
          <div className="flex flex-row gap-8">
            <p className="text-m-base text-gray-60">Здесь пока пусто</p>
          </div>
        )}
      </div>
    </div>
  );
};
