import { useMemo, useState } from 'react';
import { useEditor, GeoShapeGeoStyle } from '@ibodr/draw';
import { SwitcherAnimate } from '@xipkg/switcher-animate';
import { pageSwitcherIndicatorClass, pageSwitcherTrackClass } from 'common.ui';
import { boardTemplateGroups, shapes, solidFigures } from './shapeVariants';
import { useDrawStyles } from '../../../../hooks';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import type { ShapesPopupTab } from './types';
import {
  insertBoardTemplate,
  prepareMathFigureTool,
} from '../../../../shapes/math-figure/insertBoardTemplate';

const TABS: ShapesPopupTab[] = ['flat', 'solid', 'templates'];

const iconButtonClass =
  'flex size-8 items-center justify-center rounded-lg border bg-transparent p-1 text-icon-primary';

const shapesSwitcherTabClass = cn(
  '!h-auto flex-1 items-center justify-center rounded-lg px-1.5 py-1 text-center text-xs leading-4 font-medium',
  'data-[state=inactive]:text-text-secondary data-[state=inactive]:hover:text-text-secondary',
  'data-[state=active]:text-text-primary data-[state=active]:hover:text-text-primary',
);

const templateRowClass = cn(
  'bg-transparent hover:bg-background-page text-text-primary flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm font-medium transition-colors',
);

export const ShapeSet = ({ className, onClose }: { className?: string; onClose?: () => void }) => {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const [tab, setTab] = useState<ShapesPopupTab>('flat');
  const [activeGeo, setActiveGeo] = useState<string | null>(null);
  const [activeSolid, setActiveSolid] = useState<string | null>(null);
  const { applyStoreStylesForShape } = useDrawStyles();

  const switcherTabs = useMemo(
    () => TABS.map((id) => ({ id, label: t(`shapesPopup.tabs.${id}`) })),
    [t],
  );

  return (
    <div
      className={cn(
        'border-border-default bg-background-surface flex w-70 max-w-[calc(100vw-3rem)] flex-col gap-2 rounded-xl border p-1 shadow-none',
        className,
      )}
    >
      <SwitcherAnimate
        tabs={switcherTabs}
        activeTab={tab}
        onChange={(next) => setTab(next as ShapesPopupTab)}
        className={cn(pageSwitcherTrackClass, 'w-full sm:w-full')}
        tabClassName={shapesSwitcherTabClass}
        indicatorClassName={pageSwitcherIndicatorClass}
      />

      {tab === 'flat' && (
        <div className="flex flex-wrap gap-1">
          {shapes.map((item) => {
            const isActive = item.name === activeGeo;
            return (
              <button
                key={item.name}
                type="button"
                title={t(item.labelKey)}
                className={cn(
                  iconButtonClass,
                  isActive ? 'border-border-focus' : 'border-transparent',
                )}
                onClick={() => {
                  editor.run(() => {
                    editor.setCurrentTool('xi-geo');
                    editor.setStyleForNextShapes(GeoShapeGeoStyle, item.geo);
                    applyStoreStylesForShape('xi-geo');
                    setActiveGeo(item.name);
                    setActiveSolid(null);
                  });
                }}
              >
                {item.icon}
              </button>
            );
          })}
        </div>
      )}

      {tab === 'solid' && (
        <div className="flex flex-wrap gap-1">
          {solidFigures.map((item) => {
            const isActive = item.kind === activeSolid;
            return (
              <button
                key={item.kind}
                type="button"
                title={t(item.labelKey)}
                className={cn(
                  iconButtonClass,
                  isActive ? 'border-border-focus' : 'border-transparent',
                )}
                onClick={() => {
                  editor.run(() => {
                    prepareMathFigureTool(editor, item.kind);
                    setActiveSolid(item.kind);
                    setActiveGeo(null);
                  });
                }}
              >
                {item.icon}
              </button>
            );
          })}
        </div>
      )}

      {tab === 'templates' && (
        <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
          {boardTemplateGroups.map((group) => (
            <div key={group.subjectKey} className="flex flex-col gap-0.5">
              <span className="text-text-secondary px-2 pt-0.5 text-xs font-medium">
                {t(`shapesPopup.subjects.${group.subjectKey}`)}
              </span>
              {group.items.map((item) => (
                <button
                  key={`${group.subjectKey}-${item.id}`}
                  type="button"
                  className={templateRowClass}
                  onClick={() => {
                    insertBoardTemplate(editor, item.id);
                    onClose?.();
                  }}
                >
                  {item.icon}
                  <span>{t(item.labelKey)}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
