import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';
import { createActivityId } from '../../model/ids';
import type { ActivityAttempt, CheckStatus, RandomCardDefinition } from '../../model/types';
import { activityCardClass, activityFieldClass } from '../activityUi';
import { createEmptyAttempt } from '../../model/defaults';

type Props = {
  definition: RandomCardDefinition;
  attempt: ActivityAttempt;
  checkStatus: CheckStatus;
  mode: 'edit' | 'play';
  onDefinition: (definition: RandomCardDefinition) => void;
  onAttempt: (attempt: ActivityAttempt) => void;
};

export function RandomCardActivity({ definition, attempt, mode, onDefinition, onAttempt }: Props) {
  const { t } = useTranslation('board');
  const current = definition.cards.find((card) => card.id === attempt.currentCardId);

  if (mode === 'edit') {
    return (
      <div className="flex flex-col gap-2 p-2">
        <label className="text-text-secondary flex items-center gap-2 text-xs">
          <input
            data-board-control=""
            type="checkbox"
            checked={definition.noRepeat}
            onChange={(event) => onDefinition({ ...definition, noRepeat: event.target.checked })}
          />
          {t('activity.noRepeat')}
        </label>
        {definition.cards.map((card) => (
          <textarea
            key={card.id}
            data-board-control=""
            className={`${activityFieldClass} min-h-14 resize-y`}
            value={card.text}
            onChange={(event) =>
              onDefinition({
                ...definition,
                cards: definition.cards.map((entry) =>
                  entry.id === card.id ? { ...entry, text: event.target.value } : entry,
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
              cards: [...definition.cards, { id: createActivityId(), text: t('activity.card') }],
            })
          }
        >
          {t('activity.addCard')}
        </Button>
      </div>
    );
  }

  const draw = () => {
    if (definition.noRepeat) {
      const [nextId, ...rest] = attempt.cardQueue;
      if (!nextId) return;
      onAttempt({
        ...attempt,
        cardQueue: rest,
        currentCardId: nextId,
        drawnCount: attempt.drawnCount + 1,
      });
      return;
    }
    const pool = definition.cards.map((card) => card.id);
    if (!pool.length) return;
    const nextId = pool[Math.floor(Math.random() * pool.length)] ?? null;
    onAttempt({ ...attempt, currentCardId: nextId, drawnCount: attempt.drawnCount + 1 });
  };

  const exhausted = definition.noRepeat && attempt.cardQueue.length === 0 && attempt.currentCardId;

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div
        className={`${activityCardClass} flex min-h-24 flex-1 items-center justify-center text-center`}
      >
        {current?.text ?? t('activity.drawPrompt')}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="none"
          size="s"
          className="h-7 px-3 text-xs"
          data-board-control=""
          disabled={Boolean(exhausted)}
          onClick={draw}
        >
          {t('activity.draw')}
        </Button>
        <Button
          variant="none"
          size="s"
          className="h-7 px-3 text-xs"
          data-board-control=""
          onClick={() => onAttempt(createEmptyAttempt(definition))}
        >
          {t('activity.reshuffle')}
        </Button>
        {definition.noRepeat && (
          <span className="text-text-secondary text-xs tabular-nums">
            {attempt.drawnCount} / {definition.cards.length}
          </span>
        )}
      </div>
    </div>
  );
}
