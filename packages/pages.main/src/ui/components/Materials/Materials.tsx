import { Button } from '@xipkg/button';
import { Search } from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { MaterialsAdd } from 'features.materials.add';
import { useGetMaterialsList } from 'common.services';
import { MaterialsDuplicateProvider, useMaterialsDuplicate } from 'pages.materials';
import { MaterialsDuplicate } from 'features.materials.duplicate';
import { MaterialsCard } from 'features.materials.card';
import { useState, useMemo } from 'react';
import { cn } from '@xipkg/utils';
import { ScrollArea } from '@xipkg/scrollarea';

const MaterialsContent = () => {
  const { materialId, open, closeModal, openModal } = useMaterialsDuplicate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'note' | 'board'>('all');

  const { data: materials, isLoading } = useGetMaterialsList({
    content_type: selectedFilter === 'all' ? null : selectedFilter === 'note' ? 'note' : 'board',
  });

  // Фильтрация материалов по поисковому запросу
  const filteredMaterials = useMemo(() => {
    if (!materials) return [];

    return materials.filter((material) => {
      if (searchQuery === '') return true;
      const query = searchQuery.toLowerCase();
      return material.name?.toLowerCase().includes(query);
    });
  }, [materials, searchQuery]);

  const filters = [
    { id: 'all' as const, label: 'Все' },
    { id: 'note' as const, label: 'Заметки' },
    { id: 'board' as const, label: 'Доски' },
  ];

  return (
    <>
      <div className="bg-gray-0 flex h-[calc(100vh-272px)] w-full flex-col gap-4 rounded-2xl p-4">
        <div className="flex flex-row items-center justify-start gap-2">
          <h2 className="text-xl-base font-medium text-gray-100">Материалы</h2>
          <div className="ml-auto">
            <MaterialsAdd onlyDrafts />
          </div>
        </div>

        {/* Фильтры */}
        <div className="flex flex-row gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? 'secondary' : 'none'}
              size="s"
              className={cn(
                'rounded-lg px-4 py-2 font-medium',
                selectedFilter === filter.id
                  ? 'bg-brand-80 text-gray-0'
                  : 'border-gray-30 border text-gray-100',
              )}
              onClick={() => setSelectedFilter(filter.id)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Поиск */}
        <Input
          placeholder="Поиск по материалу или ученику"
          before={<Search className="fill-gray-60" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Список материалов */}
        <div className="flex flex-col gap-2">
          {isLoading && (
            <div className="flex h-[180px] w-full flex-row items-center justify-center gap-8">
              <p className="text-m-base text-gray-60">Загрузка...</p>
            </div>
          )}
          {!isLoading && filteredMaterials && filteredMaterials.length > 0 && (
            <ScrollArea className="h-[calc(100vh-460px)] w-full overflow-x-auto overflow-y-hidden">
              <div className="flex flex-col gap-2">
                {filteredMaterials.map((material) => (
                  <MaterialsCard
                    key={material.id}
                    onDuplicate={openModal}
                    {...material}
                    isLoading={isLoading}
                    hasIcon
                  />
                ))}
              </div>
            </ScrollArea>
          )}
          {!isLoading && (!filteredMaterials || filteredMaterials.length === 0) && (
            <div className="flex h-[180px] w-full flex-row items-center justify-center gap-8">
              <p className="text-m-base text-gray-60">
                {searchQuery ? 'Ничего не найдено' : 'Здесь пока пусто'}
              </p>
            </div>
          )}
        </div>
      </div>

      {materialId !== null && (
        <MaterialsDuplicate
          materialId={materialId}
          open={open}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              closeModal();
            }
          }}
        />
      )}
    </>
  );
};

export const Materials = () => {
  return (
    <MaterialsDuplicateProvider>
      <MaterialsContent />
    </MaterialsDuplicateProvider>
  );
};
