import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';
import { createActivityId } from '../../model/ids';
import type { ActivityAttempt, CheckStatus, MultipleChoiceDefinition } from '../../model/types';
import { Selectable } from '../primitives';
import { activityFieldClass } from '../activityUi';

type Props = {
  definition: MultipleChoiceDefinition;
  attempt: ActivityAttempt;
  checkStatus: CheckStatus;
  byItem: Record<string, boolean>;
  mode: 'edit' | 'play';
  onDefinition: (definition: MultipleChoiceDefinition) => void;
  onAttempt: (attempt: ActivityAttempt) => void;
};

export function MultipleChoiceActivity({
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
  const optionIds = attempt.optionOrder.length
    ? attempt.optionOrder
    : definition.options.map((option) => option.id);
  const optionsById = new Map(definition.options.map((option) => [option.id, option]));

  if (mode === 'edit') {
    return (
      <div className="flex flex-col gap-2 p-2">
        <textarea
          data-board-control=""
          className={`${activityFieldClass} min-h-16 resize-y`}
          value={definition.question}
          onChange={(event) => onDefinition({ ...definition, question: event.target.value })}
        />
        <label className="text-text-secondary flex items-center gap-2 text-xs">
          <input
            data-board-control=""
            type="checkbox"
            checked={definition.multiple}
            onChange={(event) => onDefinition({ ...definition, multiple: event.target.checked })}
          />
          {t('activity.multipleAnswers')}
        </label>
        <label className="text-text-secondary flex items-center gap-2 text-xs">
          <input
            data-board-control=""
            type="checkbox"
            checked={definition.randomize}
            onChange={(event) => onDefinition({ ...definition, randomize: event.target.checked })}
          />
          {t('activity.randomize')}
        </label>
        {definition.options.map((option) => (
          <div key={option.id} className="flex items-center gap-1">
            <input
              data-board-control=""
              type={definition.multiple ? 'checkbox' : 'radio'}
              name={`correct-${definition.question}`}
              checked={option.correct}
              onChange={() =>
                onDefinition({
                  ...definition,
                  options: definition.options.map((entry) =>
                    definition.multiple
                      ? entry.id === option.id
                        ? { ...entry, correct: !entry.correct }
                        : entry
                      : { ...entry, correct: entry.id === option.id },
                  ),
                })
              }
            />
            <input
              data-board-control=""
              className={activityFieldClass}
              value={option.text}
              onChange={(event) =>
                onDefinition({
                  ...definition,
                  options: definition.options.map((entry) =>
                    entry.id === option.id ? { ...entry, text: event.target.value } : entry,
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
              options: [
                ...definition.options,
                { id: createActivityId(), text: t('activity.option'), correct: false },
              ],
            })
          }
        >
          {t('activity.addOption')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <p className="text-text-primary text-sm font-medium">{definition.question}</p>
      {optionIds.map((id) => {
        const option = optionsById.get(id);
        if (!option) return null;
        const selected = Boolean(attempt.selected[option.id]);
        const status =
          checkStatus === 'idle'
            ? 'idle'
            : definition.multiple
              ? byItem[option.id]
                ? 'correct'
                : selected || option.correct
                  ? 'wrong'
                  : 'idle'
              : byItem.question
                ? selected
                  ? 'correct'
                  : 'idle'
                : selected
                  ? 'wrong'
                  : 'idle';
        return (
          <Selectable
            key={option.id}
            selected={selected}
            status={status}
            disabled={locked}
            onToggle={() => {
              const next = definition.multiple
                ? { ...attempt.selected, [option.id]: !selected }
                : Object.fromEntries(
                    definition.options.map((entry) => [entry.id, entry.id === option.id]),
                  );
              onAttempt({ ...attempt, selected: next });
            }}
          >
            {option.text}
          </Selectable>
        );
      })}
    </div>
  );
}
