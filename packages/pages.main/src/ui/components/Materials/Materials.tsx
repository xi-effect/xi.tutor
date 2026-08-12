import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Add, ArrowRight, FileSmall, WhiteBoard } from '@xipkg/icons';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { useNavigate } from '@tanstack/react-router';
import { useCurrentUser, useGetMaterialsList } from 'common.services';
import { MaterialsDuplicateProvider, useMaterialsDuplicate } from 'pages.materials';
import { MaterialsDuplicate } from 'features.materials.duplicate';
import { MaterialsCard } from 'features.materials.card';
import { useCreateMaterial } from 'features.materials.add';
import {
  EmptyMaterials,
  pageSwitcherIndicatorClass,
  pageSwitcherTabClass,
  pageSwitcherTrackClass,
} from 'common.ui';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@xipkg/utils';
import { SectionEmptyState } from '../SectionEmptyState';
import { sectionEmptyStateIllustrationClass } from '../sectionEmptyStateIllustrationClass';
import { WidgetHeader } from '../WidgetHeader';
import { galleryShadowHeaderInsetClass } from '../galleryShadowClass';
import { WidgetCardsCarousel, widgetCardSlotClass } from '../WidgetCardsCarousel';

const MaterialsContent = () => {
  const { t } = useTranslation('main');
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const isMobile = useMediaQuery('(max-width: 960px)');

  const { createMaterial } = useCreateMaterial();
  const { materialId, open, closeModal, openModal } = useMaterialsDuplicate();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'note' | 'board'>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const filters = useMemo(
    () => [
      { id: 'all' as const, label: t('materials.filterAll') },
      { id: 'note' as const, label: t('materials.filterNotes') },
      { id: 'board' as const, label: t('materials.filterBoards') },
    ],
    [t],
  );

  const handleMore = () => {
    navigate({ to: '/materials' });
  };

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
        title: t('materials.emptyNotesTitle'),
        description: t('materials.emptyNotesDescription'),
      };
    }
    if (selectedFilter === 'board') {
      return {
        title: t('materials.emptyBoardsTitle'),
        description: t('materials.emptyBoardsDescription'),
      };
    }
    return {
      title: t('materials.emptyTitle'),
      description: t('materials.emptyDescription'),
    };
  }, [selectedFilter, t]);

  const emptyActionButtonClass =
    'bg-background-surface hover:bg-background-subtle text-xs-base h-8 rounded-lg px-4 font-medium text-text-primary';

  const headerActions =
    isTutor && !isMobile ? (
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="primary"
            className="flex size-10 items-center justify-center rounded-[10px] p-0"
            data-umami-event="materials-add-button"
            id="materials-add-button"
          >
            <Add className="fill-text-on-accent size-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="bottom"
          className="border-border-default bg-background-surface flex w-[320px] flex-col gap-2.5 rounded-2xl border px-6 py-5 shadow-lg"
        >
          <DropdownMenuLabel className="text-m-base text-text-primary p-0 font-medium">
            {t('common.add')}
          </DropdownMenuLabel>
          <div className="flex flex-col gap-3">
            <DropdownMenuItem
              className="border-border-default bg-background-surface focus:bg-background-surface data-highlighted:bg-background-page flex h-9 w-[272px] cursor-pointer flex-row items-center gap-2 rounded-lg border p-2 px-3 focus:outline-none"
              onSelect={() => handleCreateMaterial('board')}
              data-umami-event="materials-add-board"
            >
              <WhiteBoard className="fill-icon-primary size-4 shrink-0" />
              <span className="text-s-base text-text-primary flex-1 text-left font-medium">
                {t('materials.addBoard')}
              </span>
              <Add className="fill-icon-brand size-4 shrink-0" />
            </DropdownMenuItem>
            <DropdownMenuItem
              className="border-border-default bg-background-surface focus:bg-background-surface data-highlighted:bg-background-page flex h-9 w-[272px] cursor-pointer flex-row items-center gap-2 rounded-lg border p-2 px-3 focus:outline-none"
              onSelect={() => handleCreateMaterial('note')}
              data-umami-event="materials-add-note"
            >
              <FileSmall className="fill-icon-primary size-4 shrink-0" />
              <span className="text-s-base text-text-primary flex-1 text-left font-medium">
                {t('materials.addNote')}
              </span>
              <Add className="fill-icon-brand size-4 shrink-0" />
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : isMobile ? (
      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button
            variant="none"
            className="hover:bg-background-subtle flex size-8 items-center justify-center rounded-lg p-0"
            onClick={handleMore}
            data-umami-event="materials-more"
          >
            <ArrowRight className="fill-icon-secondary size-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('materials.toMaterials')}</TooltipContent>
      </Tooltip>
    ) : null;

  return (
    <>
      <div className="flex w-full min-w-0 flex-col gap-4">
        <div className={galleryShadowHeaderInsetClass}>
          <WidgetHeader title={t('materials.title')} actions={headerActions}>
            {!isMobile && (
              <SwitcherAnimate
                tabs={filters}
                activeTab={selectedFilter}
                onChange={(id) => setSelectedFilter(id as 'all' | 'note' | 'board')}
                className={pageSwitcherTrackClass}
                tabClassName={pageSwitcherTabClass}
                indicatorClassName={pageSwitcherIndicatorClass}
              />
            )}
          </WidgetHeader>
        </div>

        {isLoading ? (
          <div className="flex h-[160px] w-full flex-row items-center justify-center">
            <p className="text-m-base text-text-secondary">{t('common.loading')}</p>
          </div>
        ) : filteredMaterials.length > 0 ? (
          <WidgetCardsCarousel>
            {filteredMaterials.map((material) => (
              <div key={material.id} className={widgetCardSlotClass}>
                <MaterialsCard
                  onDuplicate={openModal}
                  layout="gallery"
                  className="h-full w-full"
                  {...material}
                  isLoading={isLoading}
                />
              </div>
            ))}
          </WidgetCardsCarousel>
        ) : (
          <SectionEmptyState
            title={emptyCopy.title}
            description={emptyCopy.description}
            minHeightClass="min-h-[160px]"
            illustration={<EmptyMaterials className={sectionEmptyStateIllustrationClass} />}
            actions={
              isTutor && !isMobile ? (
                <>
                  <Button
                    type="button"
                    variant="none"
                    className={emptyActionButtonClass}
                    onClick={() => handleCreateMaterial('note')}
                    data-umami-event="materials-empty-add-note"
                  >
                    {t('materials.note')}
                    <Add className="fill-icon-primary ml-1 size-4 shrink-0" />
                  </Button>
                  <Button
                    type="button"
                    variant="none"
                    className={emptyActionButtonClass}
                    onClick={() => handleCreateMaterial('board')}
                    data-umami-event="materials-empty-add-board"
                  >
                    {t('materials.board')}
                    <Add className="fill-icon-primary ml-1 size-4 shrink-0" />
                  </Button>
                </>
              ) : undefined
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
