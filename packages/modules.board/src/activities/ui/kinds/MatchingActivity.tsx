import { Button } from '@xipkg/button';
import { Trash } from '@xipkg/icons';
import { useEditor } from '@ibodr/draw';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { createActivityId } from '../../model/ids';
import {
  linkedRightIds,
  matchingConnections,
  matchingPairs,
  toggleMatchLink,
} from '../../model/matching';
import type {
  ActivityAttempt,
  CheckStatus,
  ItemStatus,
  MatchingDefinition,
  MatchingItem,
} from '../../model/types';
import { DraggableToken, DropZone } from '../primitives';
import { ActivityInputField } from '../activityFields';
import { ActivityImage, ActivityImageIconButton } from '../ActivityImage';
import { itemStatus } from '../../primitives/itemStatus';
import { activityCardClass, activitySelectedClass, activityStatusBorderClass } from '../activityUi';
import { cn } from '@xipkg/utils';
import { ActivityMotionItem, ActivityMotionList } from '../activityUiMotion';
import { boardIconClass } from '../../../ui/boardTheme';

type Props = {
  definition: MatchingDefinition;
  attempt: ActivityAttempt;
  checkStatus: CheckStatus;
  byItem: Record<string, boolean>;
  mode: 'edit' | 'play';
  onDefinition: (definition: MatchingDefinition) => void;
  onAttempt: (attempt: ActivityAttempt) => void;
  interactLocked?: boolean;
};

function MediaFields({
  item,
  onChange,
  onRemove,
  canRemove,
  removeLabel,
}: {
  item: MatchingItem;
  onChange: (item: MatchingItem) => void;
  onRemove?: () => void;
  canRemove?: boolean;
  removeLabel?: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <ActivityInputField
        value={item.text}
        onChange={(event) => onChange({ ...item, text: event.target.value })}
      />
      <ActivityImageIconButton
        value={item.imageSrc}
        onChange={(imageSrc) => onChange({ ...item, imageSrc })}
      />
      {onRemove ? (
        <button
          type="button"
          data-board-control=""
          disabled={!canRemove}
          title={removeLabel}
          aria-label={removeLabel}
          className="text-text-secondary hover:bg-background-hover hover:text-text-primary flex size-7 shrink-0 items-center justify-center rounded-lg p-0 disabled:opacity-30"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onRemove}
        >
          <Trash className={cn('size-4', boardIconClass)} />
        </button>
      ) : null}
    </div>
  );
}

function curvePath(x1: number, y1: number, x2: number, y2: number) {
  const curve = Math.max(48, Math.abs(x2 - x1) * 0.42);
  return `M ${x1} ${y1} C ${x1 + curve} ${y1}, ${x2 - curve} ${y2}, ${x2} ${y2}`;
}

function clientToLocal(root: HTMLElement, clientX: number, clientY: number) {
  const box = root.getBoundingClientRect();
  if (box.width === 0 || box.height === 0) return { x: 0, y: 0 };
  return {
    x: ((clientX - box.left) / box.width) * root.offsetWidth,
    y: ((clientY - box.top) / box.height) * root.offsetHeight,
  };
}

function portLocalCenter(root: HTMLElement, port: HTMLElement) {
  const box = port.getBoundingClientRect();
  return clientToLocal(root, box.left + box.width / 2, box.top + box.height / 2);
}

function MatchingConnectLines({
  pairs,
  draft,
  children,
}: {
  pairs: { leftId: string; rightId: string; status: ItemStatus }[];
  draft?: { leftId: string; clientX: number; clientY: number } | null;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [paths, setPaths] = useState<{ d: string; status: ItemStatus | 'draft' }[]>([]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      setSize({ w: root.offsetWidth, h: root.offsetHeight });
      const next: { d: string; status: ItemStatus | 'draft' }[] = [];
      for (const pair of pairs) {
        const from = root.querySelector(`[data-match-port="left"][data-match-id="${pair.leftId}"]`);
        const to = root.querySelector(`[data-match-port="right"][data-match-id="${pair.rightId}"]`);
        if (!(from instanceof HTMLElement) || !(to instanceof HTMLElement)) continue;
        const a = portLocalCenter(root, from);
        const b = portLocalCenter(root, to);
        next.push({ status: pair.status, d: curvePath(a.x, a.y, b.x, b.y) });
      }
      if (draft) {
        const from = root.querySelector(
          `[data-match-port="left"][data-match-id="${draft.leftId}"]`,
        );
        if (from instanceof HTMLElement) {
          const a = portLocalCenter(root, from);
          const cursor = clientToLocal(root, draft.clientX, draft.clientY);
          next.push({ status: 'draft', d: curvePath(a.x, a.y, cursor.x, cursor.y) });
        }
      }
      setPaths(next);
    };

    measure();
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [draft, pairs]);

  return (
    <div ref={rootRef} className="relative w-full min-w-0 overflow-visible">
      <svg
        width={size.w}
        height={size.h}
        viewBox={`0 0 ${Math.max(size.w, 1)} ${Math.max(size.h, 1)}`}
        className="pointer-events-none absolute top-0 left-0 z-20 overflow-visible"
        aria-hidden
      >
        {paths.map((path, index) => (
          <path
            key={`${path.status}-${path.d}-${index}`}
            d={path.d}
            className={cn(
              'fill-none',
              path.status === 'correct' && 'stroke-green-600',
              path.status === 'wrong' && 'stroke-red-600',
              (path.status === 'idle' || path.status === 'draft') && 'stroke-brand-80',
            )}
            strokeWidth={path.status === 'draft' ? 2.25 : 3}
            strokeLinecap="round"
            strokeDasharray={path.status === 'draft' ? '6 6' : undefined}
          />
        ))}
      </svg>
      {children}
    </div>
  );
}

function MatchPort({
  side,
  itemId,
  filled,
  pulse,
  disabled,
  label,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onClick,
}: {
  side: 'left' | 'right';
  itemId: string;
  filled?: boolean;
  pulse?: boolean;
  disabled?: boolean;
  label: string;
  onPointerDown?: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerMove?: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerUp?: (event: PointerEvent<HTMLButtonElement>) => void;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      data-board-control=""
      data-match-port={side}
      data-match-id={itemId}
      disabled={disabled}
      aria-label={label}
      title={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className={cn(
        'absolute top-1/2 z-30 size-3.5 shrink-0 -translate-y-1/2 rounded-full border-2 shadow-sm',
        'touch-none',
        side === 'left' ? '-right-1.5' : '-left-1.5',
        filled ? 'border-brand-80 bg-brand-80' : 'border-brand-80 bg-background-surface',
        pulse && 'ring-brand-80/40 ring-4',
        disabled ? 'cursor-default' : 'cursor-crosshair',
      )}
    />
  );
}

const matchEditRowClass =
  'bg-background-surface border-border-default relative min-h-12 w-full rounded-2xl border px-3 py-2 shadow-none';

function flattenLinks(map: Record<string, string[]>, statusFor: (leftId: string) => ItemStatus) {
  return Object.entries(map).flatMap(([leftId, rightIds]) =>
    rightIds.map((rightId) => ({ leftId, rightId, status: statusFor(leftId) })),
  );
}

export function MatchingActivity({
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
  const [fromId, setFromId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ leftId: string; clientX: number; clientY: number } | null>(
    null,
  );
  const [hoverRightId, setHoverRightId] = useState<string | null>(null);
  const fromIdRef = useRef<string | null>(null);
  const attemptRef = useRef(attempt);
  const definitionRef = useRef(definition);
  const modeRef = useRef(mode);
  const dragMovedRef = useRef(false);
  const originRef = useRef({ x: 0, y: 0 });
  const lineLocked = mode === 'play' && (checkStatus === 'revealed' || interactLocked);
  const locked = lineLocked;
  fromIdRef.current = fromId;
  attemptRef.current = attempt;
  definitionRef.current = definition;
  modeRef.current = mode;

  const applyLink = (leftId: string, rightId: string) => {
    if (modeRef.current === 'edit') {
      const current = definitionRef.current;
      onDefinition({
        ...current,
        pairs: toggleMatchLink(matchingPairs(current), leftId, rightId),
      });
    } else {
      const current = attemptRef.current;
      onAttempt({
        ...current,
        connections: toggleMatchLink(matchingConnections(current), leftId, rightId),
      });
    }
    setDraft(null);
    setHoverRightId(null);
  };

  const drawing = draft !== null;

  useEffect(() => {
    if (!drawing || lineLocked) return;

    const onMove = (event: globalThis.PointerEvent) => {
      editor.markEventAsHandled(event);
      if (
        Math.hypot(event.clientX - originRef.current.x, event.clientY - originRef.current.y) > 6
      ) {
        dragMovedRef.current = true;
      }
      setDraft((current) =>
        current ? { ...current, clientX: event.clientX, clientY: event.clientY } : current,
      );
      const hit = document.elementFromPoint(event.clientX, event.clientY);
      const target = hit?.closest('[data-match-target]') as HTMLElement | null;
      setHoverRightId(target?.getAttribute('data-match-target') ?? null);
    };

    const onUp = (event: globalThis.PointerEvent) => {
      editor.markEventAsHandled(event);
      const leftId = fromIdRef.current;
      const hit = document.elementFromPoint(event.clientX, event.clientY);
      const rightId = (hit?.closest('[data-match-target]') as HTMLElement | null)?.getAttribute(
        'data-match-target',
      );
      const moved = dragMovedRef.current;
      setDraft(null);
      setHoverRightId(null);
      if (moved && leftId && rightId) applyLink(leftId, rightId);
    };

    window.addEventListener('pointermove', onMove, true);
    window.addEventListener('pointerup', onUp, true);
    return () => {
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onUp, true);
    };
  }, [drawing, editor, lineLocked]);

  const startLine = (leftId: string, event: PointerEvent<HTMLButtonElement>) => {
    if (locked || event.button !== 0) return;
    editor.markEventAsHandled(event);
    event.stopPropagation();
    event.preventDefault();
    dragMovedRef.current = false;
    originRef.current = { x: event.clientX, y: event.clientY };
    setFromId(leftId);
    setDraft({ leftId, clientX: event.clientX, clientY: event.clientY });
  };

  if (mode === 'edit') {
    const pairs = matchingPairs(definition);
    const linked = linkedRightIds(pairs);
    return (
      <div className="flex flex-col gap-3 overflow-visible p-3">
        <p className="text-text-secondary text-xs">{t('activity.matchingEditHint')}</p>
        <MatchingConnectLines draft={draft} pairs={flattenLinks(pairs, () => 'idle')}>
          <div className="relative grid w-full grid-cols-2 items-start gap-x-24 gap-y-4">
            <div className="flex flex-col gap-4">
              {definition.left.map((item) => {
                const selected = fromId === item.id;
                const connected = (pairs[item.id] ?? []).length > 0;
                return (
                  <div key={item.id} className="relative">
                    <div
                      data-board-control=""
                      className={cn(
                        matchEditRowClass,
                        'pr-4',
                        selected && 'border-brand-80 ring-brand-80/20 ring-2',
                        connected && !selected && 'border-brand-80',
                      )}
                    >
                      <MediaFields
                        item={item}
                        canRemove={definition.left.length > 1}
                        removeLabel={t('activity.removeItem')}
                        onChange={(next) =>
                          onDefinition({
                            ...definition,
                            left: definition.left.map((entry) =>
                              entry.id === item.id ? next : entry,
                            ),
                          })
                        }
                        onRemove={() => {
                          if (definition.left.length <= 1) return;
                          const nextPairs = { ...pairs };
                          delete nextPairs[item.id];
                          onDefinition({
                            ...definition,
                            left: definition.left.filter((entry) => entry.id !== item.id),
                            pairs: nextPairs,
                          });
                        }}
                      />
                      <MatchPort
                        side="left"
                        itemId={item.id}
                        filled={selected || connected}
                        pulse={selected}
                        label={t('activity.connectFrom')}
                        onPointerDown={(event) => startLine(item.id, event)}
                        onClick={() => {
                          if (dragMovedRef.current) return;
                          setFromId((current) => (current === item.id ? null : item.id));
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <Button
                variant="primary"
                size="s"
                className="h-7 self-start px-3 text-xs"
                data-board-control=""
                onClick={() =>
                  onDefinition({
                    ...definition,
                    left: [...definition.left, { id: createActivityId(), text: '' }],
                  })
                }
              >
                {t('activity.addLeft')}
              </Button>
            </div>
            <div className="flex flex-col gap-4">
              {definition.right.map((item) => {
                const targeted = linked.has(item.id);
                const highlighted = hoverRightId === item.id || (Boolean(fromId) && targeted);
                return (
                  <div key={item.id} className="relative">
                    <div
                      data-board-control=""
                      data-match-target={item.id}
                      className={cn(
                        matchEditRowClass,
                        'pl-4',
                        targeted && 'border-brand-80',
                        hoverRightId === item.id && 'border-brand-80 bg-status-info-background',
                        Boolean(fromId) &&
                          !targeted &&
                          hoverRightId !== item.id &&
                          'border-brand-80/40',
                      )}
                    >
                      <MediaFields
                        item={item}
                        canRemove={definition.right.length > 1}
                        removeLabel={t('activity.removeItem')}
                        onChange={(next) =>
                          onDefinition({
                            ...definition,
                            right: definition.right.map((entry) =>
                              entry.id === item.id ? next : entry,
                            ),
                          })
                        }
                        onRemove={() => {
                          if (definition.right.length <= 1) return;
                          onDefinition({
                            ...definition,
                            right: definition.right.filter((entry) => entry.id !== item.id),
                            pairs: Object.fromEntries(
                              Object.entries(pairs).map(([leftId, rightIds]) => [
                                leftId,
                                rightIds.filter((rightId) => rightId !== item.id),
                              ]),
                            ),
                          });
                        }}
                      />
                      <MatchPort
                        side="right"
                        itemId={item.id}
                        filled={targeted || hoverRightId === item.id}
                        pulse={highlighted && Boolean(fromId)}
                        label={t('activity.connectTo')}
                        onClick={() => {
                          if (!fromId) return;
                          applyLink(fromId, item.id);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <Button
                variant="primary"
                size="s"
                className="h-7 self-start px-3 text-xs"
                data-board-control=""
                onClick={() =>
                  onDefinition({
                    ...definition,
                    right: [...definition.right, { id: createActivityId(), text: '' }],
                  })
                }
              >
                {t('activity.addRight')}
              </Button>
            </div>
          </div>
        </MatchingConnectLines>
      </div>
    );
  }

  const rightOrder = attempt.bankOrder.length
    ? attempt.bankOrder
    : definition.right.map((item) => item.id);
  const rightById = new Map(definition.right.map((item) => [item.id, item]));
  const usedRight = new Set(Object.values(attempt.placements).filter(Boolean));

  const renderItem = (item: MatchingItem) => (
    <span className="flex min-w-0 items-center gap-2">
      <ActivityImage src={item.imageSrc} className="size-8 shrink-0 rounded object-cover" />
      <span className="min-w-0 wrap-break-word">{item.text}</span>
    </span>
  );

  if (definition.mode === 'drag') {
    return (
      <ActivityMotionList className="grid grid-cols-2 items-start gap-3 p-3">
        <div className="flex flex-col gap-2">
          {definition.left.map((item) => {
            const placedId = attempt.placements[item.id];
            const placed = placedId ? rightById.get(placedId) : undefined;
            return (
              <div key={item.id} className="flex items-center gap-2">
                <div className="min-w-0 flex-1 text-sm">{renderItem(item)}</div>
                <DropZone
                  zoneId={item.id}
                  label={t('activity.dropHere')}
                  status={itemStatus(checkStatus, byItem, item.id)}
                  disabled={locked}
                  child={
                    placed ? (
                      <DraggableToken
                        id={placed.id}
                        label={placed.text}
                        imageSrc={placed.imageSrc}
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
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          {rightOrder
            .map((id) => rightById.get(id))
            .filter((entry): entry is MatchingItem => entry != null && !usedRight.has(entry.id))
            .map((item) => (
              <DraggableToken
                key={item.id}
                id={item.id}
                label={item.text}
                imageSrc={item.imageSrc}
                disabled={locked}
              />
            ))}
        </div>
      </ActivityMotionList>
    );
  }

  const links = matchingConnections(attempt);
  const linked = linkedRightIds(links);

  return (
    <div className="overflow-visible px-4 py-3">
      <MatchingConnectLines
        draft={draft}
        pairs={flattenLinks(links, (leftId) => itemStatus(checkStatus, byItem, leftId))}
      >
        <ActivityMotionList className="relative grid w-full grid-cols-2 items-start gap-x-24 gap-y-3">
          <div className="flex flex-col gap-3">
            {definition.left.map((item) => {
              const connected = (links[item.id] ?? []).length > 0;
              const status = itemStatus(checkStatus, byItem, item.id);
              const selected = fromId === item.id;
              return (
                <ActivityMotionItem key={item.id} hover={false} className="relative">
                  <div
                    data-board-control=""
                    className={cn(
                      activityCardClass,
                      'relative w-full pr-5',
                      selected && activitySelectedClass,
                      connected && !selected && 'border-brand-80',
                      activityStatusBorderClass[status],
                    )}
                  >
                    {renderItem(item)}
                    <MatchPort
                      side="left"
                      itemId={item.id}
                      filled={selected || connected}
                      pulse={selected}
                      disabled={locked}
                      label={t('activity.connectFrom')}
                      onPointerDown={(event) => startLine(item.id, event)}
                      onClick={() => {
                        if (dragMovedRef.current) return;
                        setFromId((current) => (current === item.id ? null : item.id));
                      }}
                    />
                  </div>
                </ActivityMotionItem>
              );
            })}
          </div>
          <div className="flex flex-col gap-3">
            {rightOrder.map((id) => {
              const item = rightById.get(id);
              if (!item) return null;
              const targeted = linked.has(item.id);
              const highlighted = hoverRightId === item.id || (Boolean(fromId) && targeted);
              return (
                <ActivityMotionItem key={item.id} hover={false} className="relative">
                  <div
                    data-board-control=""
                    data-match-target={item.id}
                    className={cn(
                      activityCardClass,
                      'relative w-full pl-5',
                      (fromId || targeted) && 'border-brand-80',
                      (hoverRightId === item.id || Boolean(fromId)) &&
                        'bg-action-primary-background-disabled',
                    )}
                  >
                    {renderItem(item)}
                    <MatchPort
                      side="right"
                      itemId={item.id}
                      filled={targeted || hoverRightId === item.id}
                      pulse={highlighted && Boolean(fromId)}
                      disabled={locked}
                      label={t('activity.connectTo')}
                      onClick={() => {
                        if (!fromId) return;
                        applyLink(fromId, item.id);
                      }}
                    />
                  </div>
                </ActivityMotionItem>
              );
            })}
          </div>
        </ActivityMotionList>
      </MatchingConnectLines>
    </div>
  );
}
