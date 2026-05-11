import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Add, FileSmall, WhiteBoard } from '@xipkg/icons';
import { ScrollArea } from '@xipkg/scrollarea';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { useCurrentUser, useGetMaterialsList } from 'common.services';
import { MaterialsDuplicateProvider, useMaterialsDuplicate } from 'pages.materials';
import { MaterialsDuplicate } from 'features.materials.duplicate';
import { MaterialsCard } from 'features.materials.card';
import { useCreateMaterial } from 'features.materials.add';
import { EmptyMaterials } from 'common.ui';
import { useState, useMemo } from 'react';
import { SectionEmptyState, sectionEmptyStateIllustrationClass } from '../SectionEmptyState';

const filters = [
  { id: 'all' as const, label: 'Все' },
  { id: 'note' as const, label: 'Заметки' },
  { id: 'board' as const, label: 'Доски' },
];

const MaterialsContent = () => {
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

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

  const emptyCopy = useMemo(() => {
    if (selectedFilter === 'note') {
      return {
        title: 'У вас нет заметок',
        description: 'Добавьте заметку, чтобы проводить уроки было удобнее',
      };
    }
    if (selectedFilter === 'board') {
      return {
        title: 'У вас нет досок',
        description: 'Добавьте интерактивную доску для уроков',
      };
    }
    return {
      title: 'У вас нет материалов',
      description: 'Добавляйте интерактивные доски и заметки, чтобы проводить уроки было удобнее',
    };
  }, [selectedFilter]);

  const emptyActionButtonClass =
    'bg-gray-5 hover:bg-gray-10 text-xs-base h-8 rounded-lg px-4 font-medium text-gray-80';

  return (
    <>
      <div className="bg-gray-0 flex w-full flex-col gap-4 rounded-2xl px-5 pt-4 pb-1 transition-all duration-200 ease-linear sm:w-[calc(100vw-var(--sidebar-width)-var(--lessons-panel-width)-48px)]">
        {/* Header: title + tabs + add button */}
        <div className="flex flex-row flex-wrap items-center gap-4">
          <h2 className="text-l-base font-medium text-gray-100">Материалы</h2>

          {/* Tabs (Brand) */}
          <SwitcherAnimate
            tabs={filters}
            activeTab={selectedFilter}
            onChange={(id) => setSelectedFilter(id as 'all' | 'note' | 'board')}
            className="bg-gray-0 flex h-8 flex-row rounded-xl p-1"
            tabClassName="h-[26px] rounded-[10px] px-3 py-1.5 text-s-base font-medium text-gray-80 data-[active=true]:text-gray-0"
            indicatorClassName="rounded-[10px] bg-brand-80"
          />

          {isTutor && (
            <div className="ml-auto flex flex-row items-center gap-2">
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
                      onSelect={() => handleCreateMaterial('board')}
                      data-umami-event="materials-add-board"
                    >
                      <WhiteBoard className="fill-gray-80 size-4 shrink-0" />
                      <span className="text-s-base text-gray-80 flex-1 text-left font-medium">
                        Доску
                      </span>
                      <Add className="fill-brand-80 size-4 shrink-0" />
                    </DropdownMenuItem>
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
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        {/* Cards row */}
        {isLoading ? (
          <div className="flex h-[300px] w-full flex-row items-center justify-center">
            <p className="text-m-base text-gray-60">Загрузка...</p>
          </div>
        ) : filteredMaterials.length > 0 ? (
          <ScrollArea className="h-[300px] w-full">
            <div className="flex flex-row flex-wrap content-start gap-3 pr-3">
              {filteredMaterials.map((material) => (
                <MaterialsCard
                  key={material.id}
                  onDuplicate={openModal}
                  className="w-full flex-1 sm:w-auto sm:min-w-[394px]"
                  hasIcon
                  {...material}
                  isLoading={isLoading}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <SectionEmptyState
            title={emptyCopy.title}
            description={emptyCopy.description}
            minHeightClass="min-h-[160px]"
            illustration={<EmptyMaterials className={sectionEmptyStateIllustrationClass} />}
            actions={
              <>
                {isTutor && (
                  <Button
                    type="button"
                    variant="none"
                    className={emptyActionButtonClass}
                    onClick={() => handleCreateMaterial('note')}
                    data-umami-event="materials-empty-add-note"
                  >
                    Заметка
                    <Add className="fill-gray-80 ml-1 size-4 shrink-0" />
                  </Button>
                )}
                {isTutor && (
                  <Button
                    type="button"
                    variant="none"
                    className={emptyActionButtonClass}
                    onClick={() => handleCreateMaterial('board')}
                    data-umami-event="materials-empty-add-board"
                  >
                    Доска
                    <Add className="fill-gray-80 ml-1 size-4 shrink-0" />
                  </Button>
                )}
              </>
            }
          />
        )}
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
