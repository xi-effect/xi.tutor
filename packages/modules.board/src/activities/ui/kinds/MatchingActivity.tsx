import { Button } from '@xipkg/button';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createActivityId } from '../../model/ids';
import type {
  ActivityAttempt,
  CheckStatus,
  MatchingDefinition,
  MatchingItem,
} from '../../model/types';
import { DraggableToken, DropZone } from '../primitives';
import { activityFieldClass } from '../activityUi';
import { itemStatus } from '../../primitives/itemStatus';

type Props = {
  definition: MatchingDefinition;
  attempt: ActivityAttempt;
  checkStatus: CheckStatus;
  byItem: Record<string, boolean>;
  mode: 'edit' | 'play';
  onDefinition: (definition: MatchingDefinition) => void;
  onAttempt: (attempt: ActivityAttempt) => void;
};

function MediaFields({
  item,
  onChange,
}: {
  item: MatchingItem;
  onChange: (item: MatchingItem) => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <input
        data-board-control=""
        className={activityFieldClass}
        value={item.text}
        onChange={(event) => onChange({ ...item, text: event.target.value })}
      />
      <input
        data-board-control=""
        className={activityFieldClass}
        placeholder="https://"
        value={item.imageSrc ?? ''}
        onChange={(event) => onChange({ ...item, imageSrc: event.target.value })}
      />
    </div>
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
}: Props) {
  const { t } = useTranslation('board');
  const [fromId, setFromId] = useState<string | null>(null);
  const locked = checkStatus === 'revealed';

  if (mode === 'edit') {
    return (
      <div className="flex flex-col gap-2 p-2">
        <label className="text-text-secondary flex items-center gap-2 text-xs">
          <input
            data-board-control=""
            type="checkbox"
            checked={definition.mode === 'drag'}
            onChange={(event) =>
              onDefinition({ ...definition, mode: event.target.checked ? 'drag' : 'connect' })
            }
          />
          {t('activity.dragMode')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-2">
            {definition.left.map((item, index) => (
              <MediaFields
                key={item.id}
                item={item}
                onChange={(next) =>
                  onDefinition({
                    ...definition,
                    left: definition.left.map((entry) => (entry.id === item.id ? next : entry)),
                    pairs: {
                      ...definition.pairs,
                      [item.id]: definition.right[index]?.id ?? definition.pairs[item.id],
                    },
                  })
                }
              />
            ))}
            <Button
              variant="none"
              size="s"
              className="h-6 px-2 text-xs"
              data-board-control=""
              onClick={() => {
                const left = { id: createActivityId(), text: '' };
                const right = { id: createActivityId(), text: '' };
                onDefinition({
                  ...definition,
                  left: [...definition.left, left],
                  right: [...definition.right, right],
                  pairs: { ...definition.pairs, [left.id]: right.id },
                });
              }}
            >
              {t('activity.addPair')}
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {definition.right.map((item) => (
              <MediaFields
                key={item.id}
                item={item}
                onChange={(next) =>
                  onDefinition({
                    ...definition,
                    right: definition.right.map((entry) => (entry.id === item.id ? next : entry)),
                  })
                }
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const rightOrder = attempt.bankOrder.length
    ? attempt.bankOrder
    : definition.right.map((item) => item.id);
  const rightById = new Map(definition.right.map((item) => [item.id, item]));
  const usedRight = new Set(Object.values(attempt.placements).filter(Boolean));

  const renderItem = (item: MatchingItem) => (
    <div className="flex items-center gap-2">
      {item.imageSrc ? (
        <img src={item.imageSrc} alt="" className="h-10 w-10 rounded object-cover" />
      ) : null}
      <span>{item.text}</span>
    </div>
  );

  if (definition.mode === 'drag') {
    return (
      <div className="grid grid-cols-2 gap-3 p-2">
        <div className="flex flex-col gap-2">
          {definition.left.map((item) => {
            const placedId = attempt.placements[item.id];
            const placed = placedId ? rightById.get(placedId) : undefined;
            return (
              <div key={item.id} className="flex items-center gap-2">
                <div className="min-w-0 flex-1 text-sm">{renderItem(item)}</div>
                <DropZone
                  zoneId={item.id}
                  status={itemStatus(checkStatus, byItem, item.id)}
                  disabled={locked}
                  child={
                    placed ? (
                      <DraggableToken id={placed.id} label={placed.text} disabled={locked} />
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
              <DraggableToken key={item.id} id={item.id} label={item.text} disabled={locked} />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-2">
      <div className="flex flex-col gap-2">
        {definition.left.map((item) => (
          <button
            key={item.id}
            type="button"
            data-board-control=""
            disabled={locked}
            onClick={() => setFromId(item.id)}
            className={`border-border-default rounded-lg border px-2 py-1.5 text-left text-sm ${fromId === item.id ? 'ring-brand-80 ring-2' : ''} ${itemStatus(checkStatus, byItem, item.id) === 'correct' ? 'ring-2 ring-green-600/70' : ''} ${itemStatus(checkStatus, byItem, item.id) === 'wrong' ? 'ring-2 ring-red-600/70' : ''}`}
          >
            {renderItem(item)}
            {attempt.connections[item.id] ? (
              <span className="text-text-secondary mt-1 block text-xs">
                {rightById.get(attempt.connections[item.id] ?? '')?.text}
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {rightOrder.map((id) => {
          const item = rightById.get(id);
          if (!item) return null;
          return (
            <button
              key={item.id}
              type="button"
              data-board-control=""
              disabled={locked || !fromId}
              onClick={() => {
                if (!fromId) return;
                onAttempt({
                  ...attempt,
                  connections: { ...attempt.connections, [fromId]: item.id },
                });
                setFromId(null);
              }}
              className="border-border-default rounded-lg border px-2 py-1.5 text-left text-sm"
            >
              {renderItem(item)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
