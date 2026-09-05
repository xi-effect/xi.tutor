import { Button } from '@xipkg/button';
import { Trash } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useEditor } from '@ibodr/draw';
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { createActivityId } from '../../model/ids';
import type { ActivityAttempt, CheckStatus, LabelImageDefinition } from '../../model/types';
import { DraggableToken, DropZone } from '../primitives';
import { ActivityInputField } from '../activityFields';
import { ActivityImage, ActivityImageField } from '../ActivityImage';
import { itemStatus } from '../../primitives/itemStatus';
import { ActivityMotionList } from '../activityUiMotion';
import { motion } from 'motion/react';
import { boardIconClass } from '../../../ui/boardTheme';

type Props = {
  definition: LabelImageDefinition;
  attempt: ActivityAttempt;
  checkStatus: CheckStatus;
  byItem: Record<string, boolean>;
  mode: 'edit' | 'play';
  onDefinition: (definition: LabelImageDefinition) => void;
  onAttempt: (attempt: ActivityAttempt) => void;
  interactLocked?: boolean;
};

function clamp01(value: number) {
  return Math.min(0.94, Math.max(0.06, value));
}

function pointOnSurface(surface: HTMLElement, clientX: number, clientY: number) {
  const rect = surface.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return { x: 0.5, y: 0.5 };
  return {
    x: clamp01((clientX - rect.left) / rect.width),
    y: clamp01((clientY - rect.top) / rect.height),
  };
}

export function LabelImageActivity({
  definition,
  attempt,
  checkStatus,
  byItem,
  mode,
  onDefinition,
  onAttempt,
  interactLocked = false,
}: Props) {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const locked = checkStatus === 'revealed' || interactLocked;
  const surfaceRef = useRef<HTMLDivElement>(null);
  const definitionRef = useRef(definition);
  const dragOriginRef = useRef({ x: 0, y: 0 });
  const didDragRef = useRef(false);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);

  definitionRef.current = definition;

  const labels = [
    ...definition.hotspots.map((hotspot) => ({ id: hotspot.id, text: hotspot.label })),
    ...definition.extraLabels,
  ];
  const used = new Set(Object.values(attempt.placements).filter(Boolean));
  const bank = (
    attempt.bankOrder.length ? attempt.bankOrder : labels.map((label) => label.id)
  ).filter((id) => !used.has(id));
  const labelById = new Map(labels.map((label) => [label.id, label]));

  useEffect(() => {
    if (!drag?.id) return;
    const hotspotId = drag.id;

    const onMove = (event: globalThis.PointerEvent) => {
      editor.markEventAsHandled(event);
      const surface = surfaceRef.current;
      if (!surface) return;
      if (
        Math.hypot(
          event.clientX - dragOriginRef.current.x,
          event.clientY - dragOriginRef.current.y,
        ) > 4
      ) {
        didDragRef.current = true;
      }
      const next = pointOnSurface(surface, event.clientX, event.clientY);
      setDrag({ id: hotspotId, ...next });
    };

    const onUp = (event: globalThis.PointerEvent) => {
      editor.markEventAsHandled(event);
      const surface = surfaceRef.current;
      setDrag(null);
      if (!surface) return;
      const next = pointOnSurface(surface, event.clientX, event.clientY);
      const source = definitionRef.current;
      onDefinition({
        ...source,
        hotspots: source.hotspots.map((entry) =>
          entry.id === hotspotId ? { ...entry, x: next.x, y: next.y } : entry,
        ),
      });
    };

    window.addEventListener('pointermove', onMove, true);
    window.addEventListener('pointerup', onUp, true);
    return () => {
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onUp, true);
    };
  }, [drag?.id, editor, onDefinition]);

  const addHotspotAt = (x: number, y: number) => {
    onDefinition({
      ...definition,
      hotspots: [
        ...definition.hotspots,
        { id: createActivityId(), x: clamp01(x), y: clamp01(y), label: t('activity.label') },
      ],
    });
  };

  const addHotspot = (event: MouseEvent<HTMLDivElement>) => {
    if (mode !== 'edit') return;
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    const surface = surfaceRef.current ?? event.currentTarget;
    const { x, y } = pointOnSurface(surface, event.clientX, event.clientY);
    addHotspotAt(x, y);
  };

  const addHotspotButton = () => {
    const index = definition.hotspots.length;
    const offset = (index % 5) * 0.06;
    addHotspotAt(0.5 + offset * (index % 2 === 0 ? 1 : -1), 0.5 + offset * 0.5);
  };

  const startDrag = (hotspotId: string, event: PointerEvent<HTMLElement>) => {
    if (mode !== 'edit' || event.button !== 0) return;
    editor.markEventAsHandled(event);
    event.stopPropagation();
    event.preventDefault();
    const hotspot = definition.hotspots.find((entry) => entry.id === hotspotId);
    if (!hotspot) return;
    didDragRef.current = false;
    dragOriginRef.current = { x: event.clientX, y: event.clientY };
    setDrag({ id: hotspotId, x: hotspot.x, y: hotspot.y });
  };

  const surface = (
    <div
      ref={surfaceRef}
      className="absolute inset-0"
      data-board-control={mode === 'edit' ? '' : undefined}
      data-label-image-surface=""
      onClick={mode === 'edit' ? addHotspot : undefined}
    >
      {mode === 'play' &&
        (definition.imageSrc ? (
          <ActivityImage src={definition.imageSrc} className="h-full w-full object-contain" />
        ) : (
          <div className="text-text-secondary flex h-full items-center justify-center px-4 text-center text-xs">
            {t('activity.imagePlaceholderPlay')}
          </div>
        ))}
      {definition.hotspots.map((hotspot) => {
        const pos = drag?.id === hotspot.id ? drag : hotspot;
        return (
          <motion.div
            key={hotspot.id}
            className={cn(
              'absolute -translate-x-1/2 -translate-y-1/2',
              mode === 'edit' && drag?.id === hotspot.id && 'z-10',
            )}
            style={{ left: `${pos.x * 100}%`, top: `${pos.y * 100}%` }}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(event) => event.stopPropagation()}
          >
            {mode === 'edit' ? (
              <div
                className={cn(
                  'bg-background-surface border-border-default flex items-center gap-0.5 rounded-lg border-2 p-0.5 shadow-sm',
                  drag?.id === hotspot.id && 'border-brand-80 shadow-md',
                )}
              >
                <button
                  type="button"
                  data-board-control=""
                  title={t('activity.moveLabel')}
                  aria-label={t('activity.moveLabel')}
                  className="text-text-secondary hover:bg-background-hover hover:text-text-primary flex h-7 w-5 shrink-0 cursor-grab items-center justify-center rounded-md active:cursor-grabbing"
                  onPointerDown={(event) => startDrag(hotspot.id, event)}
                >
                  <span className="flex flex-col gap-0.5" aria-hidden>
                    <span className="h-0.5 w-3 rounded-full bg-current" />
                    <span className="h-0.5 w-3 rounded-full bg-current" />
                    <span className="h-0.5 w-3 rounded-full bg-current" />
                  </span>
                </button>
                <ActivityInputField
                  className="w-24"
                  value={hotspot.label}
                  onChange={(event) =>
                    onDefinition({
                      ...definition,
                      hotspots: definition.hotspots.map((entry) =>
                        entry.id === hotspot.id ? { ...entry, label: event.target.value } : entry,
                      ),
                    })
                  }
                />
                <button
                  type="button"
                  data-board-control=""
                  title={t('activity.removeItem')}
                  aria-label={t('activity.removeItem')}
                  className="text-text-secondary hover:bg-background-hover hover:text-text-primary flex size-7 shrink-0 items-center justify-center rounded-md p-0"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDefinition({
                      ...definition,
                      hotspots: definition.hotspots.filter((entry) => entry.id !== hotspot.id),
                    });
                  }}
                >
                  <Trash className={cn('size-3.5', boardIconClass)} />
                </button>
              </div>
            ) : (
              <DropZone
                zoneId={hotspot.id}
                label={t('activity.dropHere')}
                status={itemStatus(checkStatus, byItem, hotspot.id)}
                disabled={locked}
                child={
                  attempt.placements[hotspot.id] ? (
                    <DraggableToken
                      id={attempt.placements[hotspot.id]!}
                      label={labelById.get(attempt.placements[hotspot.id]!)?.text ?? ''}
                      disabled={locked}
                    />
                  ) : undefined
                }
                onDropToken={(zoneId, tokenId) => {
                  const next = { ...attempt.placements };
                  for (const [key, value] of Object.entries(next)) {
                    if (value === tokenId) next[key] = null;
                  }
                  next[zoneId] = tokenId;
                  onAttempt({ ...attempt, placements: next });
                }}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-full flex-col gap-2 p-3">
      {mode === 'edit' ? (
        <>
          <p className="text-text-secondary text-xs">{t('activity.labelEditHint')}</p>
          <ActivityImageField
            variant="cover"
            className="bg-background-subtle min-h-40 flex-1"
            value={definition.imageSrc}
            onChange={(imageSrc) => onDefinition({ ...definition, imageSrc })}
          >
            {surface}
          </ActivityImageField>
        </>
      ) : (
        <div className="bg-background-subtle relative min-h-40 flex-1 overflow-hidden rounded-xl">
          {surface}
        </div>
      )}
      {mode === 'play' && (
        <ActivityMotionList className="flex flex-wrap gap-1">
          {bank.map((id) => {
            const label = labelById.get(id);
            if (!label) return null;
            return <DraggableToken key={id} id={id} label={label.text} disabled={locked} />;
          })}
        </ActivityMotionList>
      )}
      {mode === 'edit' && (
        <div className="flex flex-col gap-1">
          {definition.extraLabels.map((label) => (
            <div key={label.id} className="flex items-center gap-1">
              <ActivityInputField
                value={label.text}
                onChange={(event) =>
                  onDefinition({
                    ...definition,
                    extraLabels: definition.extraLabels.map((entry) =>
                      entry.id === label.id ? { ...entry, text: event.target.value } : entry,
                    ),
                  })
                }
              />
              <button
                type="button"
                data-board-control=""
                title={t('activity.removeItem')}
                aria-label={t('activity.removeItem')}
                className="text-text-secondary hover:bg-background-hover hover:text-text-primary flex size-7 shrink-0 items-center justify-center rounded-lg p-0"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() =>
                  onDefinition({
                    ...definition,
                    extraLabels: definition.extraLabels.filter((entry) => entry.id !== label.id),
                  })
                }
              >
                <Trash className={cn('size-4', boardIconClass)} />
              </button>
            </div>
          ))}
          <div className="flex flex-wrap gap-1">
            <Button
              variant="default"
              size="s"
              className="h-7 self-start px-3 text-xs"
              data-board-control=""
              onClick={addHotspotButton}
            >
              {t('activity.addLabel')}
            </Button>
            <Button
              variant="default"
              size="s"
              className="h-7 self-start px-3 text-xs"
              data-board-control=""
              onClick={() =>
                onDefinition({
                  ...definition,
                  extraLabels: [
                    ...definition.extraLabels,
                    { id: createActivityId(), text: t('activity.distractor') },
                  ],
                })
              }
            >
              {t('activity.addDistractor')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
