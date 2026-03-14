import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Add, FileSmall, WhiteBoard } from '@xipkg/icons';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { useGetMaterialsList } from 'common.services';
import { MaterialsDuplicateProvider, useMaterialsDuplicate } from 'pages.materials';
import { MaterialsDuplicate } from 'features.materials.duplicate';
import { MaterialsCard } from 'features.materials.card';
import { useCreateMaterial } from 'features.materials.add';
import { useState, useMemo } from 'react';

const filters = [
  { id: 'all' as const, label: 'Все' },
  { id: 'note' as const, label: 'Заметки' },
  { id: 'board' as const, label: 'Доски' },
];

const MaterialsContent = () => {
  const { createMaterial } = useCreateMaterial();
  const { materialId, open, closeModal, openModal } = useMaterialsDuplicate();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'note' | 'board'>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleCreateMaterial = (kind: 'note' | 'board') => {
    setDropdownOpen(false);
    createMaterial(kind);
  };

  const { data: materials, isLoading } = useGetMaterialsList({
    content_type: selectedFilter === 'all' ? null : selectedFilter === 'note' ? 'note' : 'board',
  });

  const filteredMaterials = useMemo(() => materials ?? [], [materials]);

  return (
    <>
      <div className="bg-gray-0 flex w-[calc(100vw-var(--sidebar-width)-var(--lessons-panel-width)-48px)] flex-col gap-5 rounded-2xl p-5 px-6 transition-all duration-200 ease-linear">
        {/* Header: title + tabs + add button */}
        <div className="flex flex-row flex-wrap items-center gap-5">
          <h2 className="text-[20px] leading-7 font-semibold text-[#0F0F11]">Материалы</h2>

          {/* Tabs (Brand) */}
          <SwitcherAnimate
            tabs={filters}
            activeTab={selectedFilter}
            onChange={(id) => setSelectedFilter(id as 'all' | 'note' | 'board')}
            className="bg-gray-5 flex h-9 flex-row rounded-xl p-1"
            tabClassName="rounded-[10px] px-3 py-1.5 text-s-base font-medium text-gray-80 data-[active=true]:text-gray-0"
            indicatorClassName="rounded-[10px] bg-brand-80"
          />

          <div className="ml-auto">
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="none"
                  className="bg-brand-0 hover:bg-brand-20/50 active:bg-brand-20/50 flex h-8 w-10 items-center justify-center rounded-lg p-0"
                  data-umami-event="materials-add-button"
                  id="materials-add-button"
                >
                  <Add className="fill-brand-80 size-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="bottom"
                className="border-gray-10 bg-gray-0 flex w-[320px] flex-col gap-2.5 rounded-2xl border px-6 py-5 shadow-lg"
              >
                <DropdownMenuLabel className="text-m-base p-0 font-medium text-gray-100">
                  Добавить
                </DropdownMenuLabel>
                <div className="flex flex-col gap-3">
                  <DropdownMenuItem
                    className="border-gray-10 bg-gray-0 focus:bg-gray-0 data-highlighted:bg-gray-5 flex h-9 w-[272px] cursor-pointer flex-row items-center gap-2 rounded-lg border p-2 px-3 focus:outline-none"
                    onSelect={() => handleCreateMaterial('note')}
                    data-umami-event="materials-add-note"
                  >
                    <FileSmall className="fill-gray-80 size-4 shrink-0" />
                    <span className="text-s-base text-gray-80 flex-1 text-left font-medium">
                      Заметку
                    </span>
                    <Add className="fill-brand-80 size-4 shrink-0" />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="border-gray-10 bg-gray-0 focus:bg-gray-0 data-highlighted:bg-gray-5 flex h-9 w-[272px] cursor-pointer flex-row items-center gap-2 rounded-lg border p-2 px-3 focus:outline-none"
                    onSelect={() => handleCreateMaterial('board')}
                    data-umami-event="materials-add-board"
                  >
                    <WhiteBoard className="fill-gray-80 size-4 shrink-0" />
                    <span className="text-s-base text-gray-80 flex-1 text-left font-medium">
                      Доску
                    </span>
                    <Add className="fill-brand-80 size-4 shrink-0" />
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
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
