import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';
import { createActivityId } from '../../model/ids';
import type { ActivityAttempt, CheckStatus, MysteryTilesDefinition } from '../../model/types';
import { HiddenContent } from '../primitives';
import { ActivityInputField } from '../activityFields';
import { ActivityImage, ActivityImageField } from '../ActivityImage';
import { ActivityMotionItem, ActivityMotionList } from '../activityUiMotion';

type Props = {
  definition: MysteryTilesDefinition;
  attempt: ActivityAttempt;
  checkStatus: CheckStatus;
  mode: 'edit' | 'play';
  onDefinition: (definition: MysteryTilesDefinition) => void;
  onAttempt: (attempt: ActivityAttempt) => void;
  interactLocked?: boolean;
};

export function MysteryTilesActivity({
  definition,
  attempt,
  mode,
  onDefinition,
  onAttempt,
  interactLocked = false,
}: Props) {
  const { t } = useTranslation('board');
  const columns = Math.max(1, definition.columns);

  if (mode === 'edit') {
    return (
      <div className="flex flex-col gap-2 p-3">
        <label className="text-text-secondary flex items-center gap-2 text-xs">
          {t('activity.columns')}
          <ActivityInputField
            type="number"
            min={1}
            max={6}
            className="w-16"
            value={definition.columns}
            onChange={(event) =>
              onDefinition({ ...definition, columns: Math.max(1, Number(event.target.value) || 1) })
            }
          />
        </label>
        {definition.tiles.map((tile) => (
          <div key={tile.id} className="flex flex-col gap-1">
            <ActivityInputField
              value={tile.text}
              onChange={(event) =>
                onDefinition({
                  ...definition,
                  tiles: definition.tiles.map((entry) =>
                    entry.id === tile.id ? { ...entry, text: event.target.value } : entry,
                  ),
                })
              }
            />
            <ActivityImageField
              value={tile.imageSrc}
              onChange={(imageSrc) =>
                onDefinition({
                  ...definition,
                  tiles: definition.tiles.map((entry) =>
                    entry.id === tile.id ? { ...entry, imageSrc } : entry,
                  ),
                })
              }
            />
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
              tiles: [...definition.tiles, { id: createActivityId(), text: t('activity.tile') }],
            })
          }
        >
          {t('activity.addTile')}
        </Button>
      </div>
    );
  }

  return (
    <ActivityMotionList
      className="grid h-full gap-2 p-3"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {definition.tiles.map((tile) => (
        <ActivityMotionItem key={tile.id} hover={false}>
          <HiddenContent
            revealed={Boolean(attempt.revealed[tile.id])}
            disabled={interactLocked}
            onReveal={() =>
              onAttempt({ ...attempt, revealed: { ...attempt.revealed, [tile.id]: true } })
            }
          >
            {tile.imageSrc ? (
              <span className="flex flex-col items-center gap-1">
                <ActivityImage src={tile.imageSrc} className="max-h-24 object-contain" />
                {tile.text ? <span>{tile.text}</span> : null}
              </span>
            ) : (
              tile.text
            )}
          </HiddenContent>
        </ActivityMotionItem>
      ))}
    </ActivityMotionList>
  );
}
