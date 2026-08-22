import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';
import { createActivityId } from '../../model/ids';
import type { ActivityAttempt, CheckStatus, MysteryTilesDefinition } from '../../model/types';
import { HiddenContent } from '../primitives';
import { activityFieldClass } from '../activityUi';

type Props = {
  definition: MysteryTilesDefinition;
  attempt: ActivityAttempt;
  checkStatus: CheckStatus;
  mode: 'edit' | 'play';
  onDefinition: (definition: MysteryTilesDefinition) => void;
  onAttempt: (attempt: ActivityAttempt) => void;
};

export function MysteryTilesActivity({
  definition,
  attempt,
  mode,
  onDefinition,
  onAttempt,
}: Props) {
  const { t } = useTranslation('board');
  const columns = Math.max(1, definition.columns);

  if (mode === 'edit') {
    return (
      <div className="flex flex-col gap-2 p-2">
        <label className="text-text-secondary flex items-center gap-2 text-xs">
          {t('activity.columns')}
          <input
            data-board-control=""
            type="number"
            min={1}
            max={6}
            className={`${activityFieldClass} w-16`}
            value={definition.columns}
            onChange={(event) =>
              onDefinition({ ...definition, columns: Math.max(1, Number(event.target.value) || 1) })
            }
          />
        </label>
        {definition.tiles.map((tile) => (
          <input
            key={tile.id}
            data-board-control=""
            className={activityFieldClass}
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
        ))}
        <Button
          variant="none"
          size="s"
          className="h-6 self-start px-2 text-xs"
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
    <div
      className="grid gap-2 p-2"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {definition.tiles.map((tile) => (
        <HiddenContent
          key={tile.id}
          revealed={Boolean(attempt.revealed[tile.id])}
          onReveal={() =>
            onAttempt({ ...attempt, revealed: { ...attempt.revealed, [tile.id]: true } })
          }
        >
          {tile.imageSrc ? (
            <img src={tile.imageSrc} alt="" className="max-h-24 object-contain" />
          ) : (
            tile.text
          )}
        </HiddenContent>
      ))}
    </div>
  );
}
