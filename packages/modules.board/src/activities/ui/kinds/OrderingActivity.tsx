import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';
import { createActivityId } from '../../model/ids';
import type { ActivityAttempt, CheckStatus, OrderingDefinition } from '../../model/types';
import { activityCardClass, activityFieldClass } from '../activityUi';
import { itemStatus } from '../../primitives/itemStatus';

type Props = {
  definition: OrderingDefinition;
  attempt: ActivityAttempt;
  checkStatus: CheckStatus;
  byItem: Record<string, boolean>;
  mode: 'edit' | 'play';
  onDefinition: (definition: OrderingDefinition) => void;
  onAttempt: (attempt: ActivityAttempt) => void;
};

export function OrderingActivity({
  definition,
  attempt,
  checkStatus,
  byItem,
  mode,
  onDefinition,
  onAttempt,
}: Props) {
  const { t } = useTranslation('board');
  const locked = checkStatus === 'revealed';
  const order = attempt.order.length ? attempt.order : definition.items.map((item) => item.id);
  const itemsById = new Map(definition.items.map((item) => [item.id, item]));

  if (mode === 'edit') {
    return (
      <div className="flex flex-col gap-2 p-2">
        <p className="text-text-secondary text-xs">{t('activity.orderingHint')}</p>
        {definition.items.map((item, index) => (
          <div key={item.id} className="flex gap-1">
            <span className="text-text-secondary w-4 text-xs">{index + 1}</span>
            <input
              data-board-control=""
              className={activityFieldClass}
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
          </div>
        ))}
        <Button
          variant="none"
          size="s"
          className="h-6 self-start px-2 text-xs"
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
    <div className="flex flex-col gap-1 p-2">
      {order.map((id, index) => {
        const item = itemsById.get(id);
        if (!item) return null;
        return (
          <div
            key={id}
            className={`${activityCardClass} flex items-center gap-2 ${itemStatus(checkStatus, byItem, id) === 'correct' ? 'ring-2 ring-green-600/70' : ''} ${itemStatus(checkStatus, byItem, id) === 'wrong' ? 'ring-2 ring-red-600/70' : ''}`}
          >
            <span className="text-text-secondary w-4 text-xs">{index + 1}</span>
            <span className="min-w-0 flex-1">{item.text}</span>
            <button
              type="button"
              data-board-control=""
              disabled={locked}
              onClick={() => move(index, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              data-board-control=""
              disabled={locked}
              onClick={() => move(index, 1)}
            >
              ↓
            </button>
          </div>
        );
      })}
    </div>
  );
}
