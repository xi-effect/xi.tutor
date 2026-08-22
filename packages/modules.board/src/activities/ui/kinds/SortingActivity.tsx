import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';
import { createActivityId } from '../../model/ids';
import type { ActivityAttempt, CheckStatus, SortingDefinition } from '../../model/types';
import { DraggableToken, DropZone } from '../primitives';
import { activityFieldClass } from '../activityUi';
import { itemStatus } from '../../primitives/itemStatus';

type Props = {
  definition: SortingDefinition;
  attempt: ActivityAttempt;
  checkStatus: CheckStatus;
  byItem: Record<string, boolean>;
  mode: 'edit' | 'play';
  onDefinition: (definition: SortingDefinition) => void;
  onAttempt: (attempt: ActivityAttempt) => void;
};

export function SortingActivity({
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

  if (mode === 'edit') {
    return (
      <div className="flex flex-col gap-2 p-2">
        {definition.categories.map((category) => (
          <input
            key={category.id}
            data-board-control=""
            className={activityFieldClass}
            value={category.title}
            onChange={(event) =>
              onDefinition({
                ...definition,
                categories: definition.categories.map((entry) =>
                  entry.id === category.id ? { ...entry, title: event.target.value } : entry,
                ),
              })
            }
          />
        ))}
        <Button
          variant="none"
          size="s"
          className="h-6 self-start px-2 text-xs"
          data-board-control=""
          onClick={() =>
            onDefinition({
              ...definition,
              categories: [
                ...definition.categories,
                { id: createActivityId(), title: t('activity.category') },
              ],
            })
          }
        >
          {t('activity.addCategory')}
        </Button>
        {definition.items.map((item) => (
          <div key={item.id} className="flex gap-1">
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
            <select
              data-board-control=""
              className={activityFieldClass}
              value={item.categoryId}
              onChange={(event) =>
                onDefinition({
                  ...definition,
                  items: definition.items.map((entry) =>
                    entry.id === item.id ? { ...entry, categoryId: event.target.value } : entry,
                  ),
                })
              }
            >
              {definition.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
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
              items: [
                ...definition.items,
                {
                  id: createActivityId(),
                  text: t('activity.card'),
                  categoryId: definition.categories[0]?.id ?? '',
                },
              ],
            })
          }
        >
          {t('activity.addCard')}
        </Button>
      </div>
    );
  }

  const bankIds = (
    attempt.bankOrder.length ? attempt.bankOrder : definition.items.map((item) => item.id)
  ).filter((id) => !attempt.placements[id]);
  const itemsById = new Map(definition.items.map((item) => [item.id, item]));

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex flex-wrap gap-1">
        {bankIds.map((id) => {
          const item = itemsById.get(id);
          if (!item) return null;
          return <DraggableToken key={id} id={id} label={item.text} disabled={locked} />;
        })}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {definition.categories.map((category) => (
          <div key={category.id} className="flex flex-col gap-1">
            <span className="text-text-primary text-xs font-medium">{category.title}</span>
            <DropZone
              zoneId={category.id}
              label={t('activity.dropHere')}
              disabled={locked}
              onDropToken={(_zoneId, tokenId) =>
                onAttempt({
                  ...attempt,
                  placements: { ...attempt.placements, [tokenId]: category.id },
                })
              }
            />
            <div className="flex flex-col gap-1">
              {definition.items
                .filter((item) => attempt.placements[item.id] === category.id)
                .map((item) => (
                  <DraggableToken
                    key={item.id}
                    id={item.id}
                    label={item.text}
                    disabled={locked}
                    status={itemStatus(checkStatus, byItem, item.id)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
