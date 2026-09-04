import { Button } from '@xipkg/button';
import { ArrowBottom, ArrowUp, Trash } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import { createActivityId } from '../../model/ids';
import type { ActivityAttempt, CheckStatus, OrderingDefinition } from '../../model/types';
import { activityCardClass, activityStatusBorderClass } from '../activityUi';
import { ActivityInputField } from '../activityFields';
import { ActivityImage, ActivityImageIconButton } from '../ActivityImage';
import { itemStatus } from '../../primitives/itemStatus';
import { cn } from '@xipkg/utils';
import { motion } from 'motion/react';
import { ActivityMotionList, activityItemTransition } from '../activityUiMotion';
import { boardIconClass } from '../../../ui/boardTheme';

type Props = {
  definition: OrderingDefinition;
  attempt: ActivityAttempt;
  checkStatus: CheckStatus;
  byItem: Record<string, boolean>;
  mode: 'edit' | 'play';
  onDefinition: (definition: OrderingDefinition) => void;
  onAttempt: (attempt: ActivityAttempt) => void;
  interactLocked?: boolean;
};

export function OrderingActivity({
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
  const locked = checkStatus === 'revealed' || interactLocked;
  const order = attempt.order.length ? attempt.order : definition.items.map((item) => item.id);
  const itemsById = new Map(definition.items.map((item) => [item.id, item]));

  if (mode === 'edit') {
    return (
      <div className="flex flex-col gap-2 p-3">
        <p className="text-text-secondary text-xs">{t('activity.orderingHint')}</p>
        {definition.items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-1">
            <span className="text-text-secondary w-4 shrink-0 text-xs">{index + 1}</span>
            <ActivityInputField
              value={item.text}
              onChange={(event) =>
                onDefinition({
                  ...definition,
                  items: definition.items.map((entry) =>
                    entry.id === item.id ? { ...entry, text: event.target.value } : entry,
                  ),
                })
              }
            />
            <ActivityImageIconButton
              value={item.imageSrc}
              onChange={(imageSrc) =>
                onDefinition({
                  ...definition,
                  items: definition.items.map((entry) =>
                    entry.id === item.id ? { ...entry, imageSrc } : entry,
                  ),
                })
              }
            />
            <button
              type="button"
              data-board-control=""
              disabled={definition.items.length <= 1}
              title={t('activity.removeItem')}
              aria-label={t('activity.removeItem')}
              className="text-text-secondary hover:bg-background-hover hover:text-text-primary flex size-7 shrink-0 items-center justify-center rounded-lg p-0 disabled:opacity-30"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => {
                if (definition.items.length <= 1) return;
                onDefinition({
                  ...definition,
                  items: definition.items.filter((entry) => entry.id !== item.id),
                });
              }}
            >
              <Trash className={cn('size-4', boardIconClass)} />
            </button>
          </div>
        ))}
        <Button
          variant="default"
          size="s"
          className="h-7 self-start px-3 text-xs"
          data-board-control=""
          onClick={() =>
            onDefinition({
              ...definition,
              items: [...definition.items, { id: createActivityId(), text: t('activity.card') }],
            })
          }
        >
          {t('activity.addCard')}
        </Button>
      </div>
    );
  }

  const move = (index: number, direction: -1 | 1) => {
    const next = [...order];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const current = next[index]!;
    next[index] = next[target]!;
    next[target] = current;
    onAttempt({ ...attempt, order: next });
  };

  return (
    <ActivityMotionList className="flex flex-col gap-1 p-3">
      {order.map((id, index) => {
        const item = itemsById.get(id);
        if (!item) return null;
        return (
          <motion.div
            key={id}
            layout
            variants={{
              hidden: { opacity: 0, y: 10, scale: 0.96 },
              show: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={activityItemTransition}
            whileHover={locked ? undefined : { scale: 1.01 }}
            className={cn(
              activityCardClass,
              'flex items-center gap-2',
              activityStatusBorderClass[itemStatus(checkStatus, byItem, id)],
            )}
          >
            <span className="text-text-secondary w-4 text-xs">{index + 1}</span>
            <ActivityImage src={item.imageSrc} className="size-8 shrink-0 rounded object-cover" />
            <span className="min-w-0 flex-1">{item.text}</span>
            <Button
              type="button"
              variant="secondary"
              size="s"
              className="size-7 p-0"
              data-board-control=""
              disabled={locked}
              onClick={() => move(index, -1)}
            >
              <ArrowUp size="sm" className="size-4 text-inherit" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="s"
              className="size-7 p-0"
              data-board-control=""
              disabled={locked}
              onClick={() => move(index, 1)}
            >
              <ArrowBottom size="sm" className="size-4 text-inherit" />
            </Button>
          </motion.div>
        );
      })}
    </ActivityMotionList>
  );
}
