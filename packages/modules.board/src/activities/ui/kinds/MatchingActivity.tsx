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
import { ActivityInputField } from '../activityFields';
import { ActivityImage, ActivityImageField } from '../ActivityImage';
import { itemStatus } from '../../primitives/itemStatus';
import { activityCardClass, activitySelectedClass, activityStatusBorderClass } from '../activityUi';
import { cn } from '@xipkg/utils';
import { ActivityMotionItem, ActivityMotionList } from '../activityUiMotion';

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
}: {
  item: MatchingItem;
  onChange: (item: MatchingItem) => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <ActivityInputField
        value={item.text}
        onChange={(event) => onChange({ ...item, text: event.target.value })}
      />
      <ActivityImageField
        value={item.imageSrc}
        onChange={(imageSrc) => onChange({ ...item, imageSrc })}
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
  interactLocked = false,
}: Props) {
  const { t } = useTranslation('board');
  const [fromId, setFromId] = useState<string | null>(null);
  const locked = checkStatus === 'revealed' || interactLocked;

  if (mode === 'edit') {
    return (
      <div className="flex flex-col gap-2 p-3">
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
              variant="default"
              size="s"
              className="h-7 self-start px-3 text-xs"
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

  return (
    <ActivityMotionList className="grid grid-cols-2 items-start gap-3 p-3">
      <div className="flex flex-col gap-2">
        {definition.left.map((item) => {
          const connected = rightById.get(attempt.connections[item.id] ?? '');
          const status = itemStatus(checkStatus, byItem, item.id);
          return (
            <ActivityMotionItem key={item.id}>
              <Button
                type="button"
                variant="none"
                size="s"
                data-board-control=""
                disabled={locked}
                onClick={() => setFromId(item.id)}
                className={cn(
                  activityCardClass,
                  'h-auto w-full flex-col items-stretch justify-start gap-1 px-2 py-1.5 text-left',
                  fromId === item.id && activitySelectedClass,
                  activityStatusBorderClass[status],
                )}
              >
                {renderItem(item)}
                {connected ? (
                  <span className="text-text-secondary border-border-default w-full border-t pt-1 text-xs">
                    {connected.text}
                  </span>
                ) : null}
              </Button>
            </ActivityMotionItem>
          );
        })}
      </div>
      <div className="flex flex-col gap-2">
        {rightOrder.map((id) => {
          const item = rightById.get(id);
          if (!item) return null;
          return (
            <ActivityMotionItem key={item.id}>
              <Button
                type="button"
                variant="none"
                size="s"
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
                className={cn(
                  activityCardClass,
                  'h-auto w-full items-center justify-start px-2 py-1.5 text-left',
                )}
              >
                {renderItem(item)}
              </Button>
            </ActivityMotionItem>
          );
        })}
      </div>
    </ActivityMotionList>
  );
}
