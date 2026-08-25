import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';
import type { MouseEvent } from 'react';
import { createActivityId } from '../../model/ids';
import type { ActivityAttempt, CheckStatus, LabelImageDefinition } from '../../model/types';
import { DraggableToken, DropZone } from '../primitives';
import { ActivityInputField } from '../activityFields';
import { ActivityImage, ActivityImageField } from '../ActivityImage';
import { itemStatus } from '../../primitives/itemStatus';
import { ActivityMotionList } from '../activityUiMotion';
import { motion } from 'motion/react';

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
  const locked = checkStatus === 'revealed' || interactLocked;
  const labels = [
    ...definition.hotspots.map((hotspot) => ({ id: hotspot.id, text: hotspot.label })),
    ...definition.extraLabels,
  ];
  const used = new Set(Object.values(attempt.placements).filter(Boolean));
  const bank = (
    attempt.bankOrder.length ? attempt.bankOrder : labels.map((label) => label.id)
  ).filter((id) => !used.has(id));
  const labelById = new Map(labels.map((label) => [label.id, label]));

  const addHotspot = (event: MouseEvent<HTMLDivElement>) => {
    if (mode !== 'edit') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    onDefinition({
      ...definition,
      hotspots: [
        ...definition.hotspots,
        { id: createActivityId(), x, y, label: t('activity.label') },
      ],
    });
  };

  const surface = (
    <>
      {mode === 'play' &&
        (definition.imageSrc ? (
          <ActivityImage src={definition.imageSrc} className="h-full w-full object-contain" />
        ) : (
          <div className="text-text-secondary flex h-full items-center justify-center px-4 text-center text-xs">
            {t('activity.imagePlaceholderPlay')}
          </div>
        ))}
      {definition.hotspots.map((hotspot) => (
        <motion.div
          key={hotspot.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${hotspot.x * 100}%`, top: `${hotspot.y * 100}%` }}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={(event) => event.stopPropagation()}
        >
          {mode === 'edit' ? (
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
      ))}
    </>
  );

  return (
    <div className="flex h-full flex-col gap-2 p-3">
      {mode === 'edit' ? (
        <ActivityImageField
          variant="cover"
          className="bg-background-subtle min-h-40 flex-1"
          value={definition.imageSrc}
          onChange={(imageSrc) => onDefinition({ ...definition, imageSrc })}
          onSurfaceClick={addHotspot}
        >
          {surface}
        </ActivityImageField>
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
      )}
    </div>
  );
}
