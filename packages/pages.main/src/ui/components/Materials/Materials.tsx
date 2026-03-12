import { MaterialsAdd } from 'features.materials.add';
import { useGetMaterialsList } from 'common.services';
import { MaterialsDuplicateProvider, useMaterialsDuplicate } from 'pages.materials';
import { MaterialsDuplicate } from 'features.materials.duplicate';
import { MaterialsCard } from 'features.materials.card';
import { useState, useMemo } from 'react';
import { cn } from '@xipkg/utils';

const MaterialsContent = () => {
  const { materialId, open, closeModal, openModal } = useMaterialsDuplicate();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'note' | 'board'>('all');

  const { data: materials, isLoading } = useGetMaterialsList({
    content_type: selectedFilter === 'all' ? null : selectedFilter === 'note' ? 'note' : 'board',
  });

  const filteredMaterials = useMemo(() => materials ?? [], [materials]);

  const filters = [
    { id: 'all' as const, label: 'Все' },
    { id: 'note' as const, label: 'Заметки' },
    { id: 'board' as const, label: 'Доски' },
  ];

  return (
    <>
      <div className="bg-gray-0 flex w-[calc(100vw-var(--sidebar-width)-var(--lessons-panel-width)-48px)] flex-col gap-5 rounded-2xl p-5 px-6 transition-all duration-200 ease-linear">
        {/* Header: title + tabs + add button */}
        <div className="flex flex-row flex-wrap items-center gap-5">
          <h2 className="text-[20px] leading-7 font-semibold text-[#0F0F11]">Материалы</h2>

          {/* Tabs (Brand) */}
          <div className="flex flex-row items-center rounded-xl bg-white p-[3px]">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={cn(
                  'rounded-[10px] px-3 py-1.5 text-sm leading-5 font-medium',
                  selectedFilter === filter.id
                    ? 'bg-[#4155D0] text-[#F3F4FD]'
                    : 'bg-white text-[#3D3E43]',
                )}
                onClick={() => setSelectedFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="ml-auto">
            <MaterialsAdd onlyDrafts />
          </div>
        </div>

        {/* Cards grid */}
        <div className="flex flex-row flex-wrap content-start gap-3">
          {isLoading && (
            <div className="flex h-[180px] w-full flex-row items-center justify-center">
              <p className="text-m-base text-gray-60">Загрузка...</p>
            </div>
          )}
          {!isLoading && filteredMaterials.length > 0 && (
            <>
              {filteredMaterials.map((material) => (
                <MaterialsCard
                  key={material.id}
                  onDuplicate={openModal}
                  layout="compact"
                  hasIcon
                  {...material}
                  isLoading={isLoading}
                />
              ))}
            </>
          )}
          {!isLoading && filteredMaterials.length === 0 && (
            <div className="flex h-[180px] w-full flex-row items-center justify-center">
              <p className="text-m-base text-gray-60">Здесь пока пусто</p>
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
