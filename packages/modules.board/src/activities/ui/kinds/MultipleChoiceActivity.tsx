import { Button } from '@xipkg/button';
import { Checkbox } from '@xipkg/checkbox';
import { Radio, RadioItem } from '@xipkg/radio';
import { useTranslation } from 'react-i18next';
import { createActivityId } from '../../model/ids';
import type { ActivityAttempt, CheckStatus, MultipleChoiceDefinition } from '../../model/types';
import { Selectable } from '../primitives';
import { ActivityInputField, ActivityTextareaField } from '../activityFields';
import { ActivityMotionList } from '../activityUiMotion';

type Props = {
  definition: MultipleChoiceDefinition;
  attempt: ActivityAttempt;
  checkStatus: CheckStatus;
  byItem: Record<string, boolean>;
  mode: 'edit' | 'play';
  onDefinition: (definition: MultipleChoiceDefinition) => void;
  onAttempt: (attempt: ActivityAttempt) => void;
  interactLocked?: boolean;
};

export function MultipleChoiceActivity({
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
  const optionIds = attempt.optionOrder.length
    ? attempt.optionOrder
    : definition.options.map((option) => option.id);
  const optionsById = new Map(definition.options.map((option) => [option.id, option]));

  if (mode === 'edit') {
    return (
      <div className="flex flex-col gap-2 p-3">
        <ActivityTextareaField
          value={definition.question}
          onChange={(event) => onDefinition({ ...definition, question: event.target.value })}
        />
        {definition.multiple ? (
          definition.options.map((option) => (
            <div key={option.id} className="flex items-center gap-1">
              <Checkbox
                size="s"
                data-board-control=""
                checked={option.correct}
                onCheckedChange={() =>
                  onDefinition({
                    ...definition,
                    options: definition.options.map((entry) =>
                      entry.id === option.id ? { ...entry, correct: !entry.correct } : entry,
                    ),
                  })
                }
                onPointerDown={(event) => event.stopPropagation()}
              />
              <ActivityInputField
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
          ))
        ) : (
          <Radio
            value={definition.options.find((option) => option.correct)?.id ?? ''}
            onValueChange={(id) =>
              onDefinition({
                ...definition,
                options: definition.options.map((entry) => ({
                  ...entry,
                  correct: entry.id === id,
                })),
              })
            }
            className="flex flex-col gap-2"
            data-board-control=""
            onPointerDown={(event) => event.stopPropagation()}
          >
            {definition.options.map((option) => (
              <div key={option.id} className="flex items-center gap-1">
                <RadioItem value={option.id} />
                <ActivityInputField
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
          </Radio>
        )}
        <Button
          variant="default"
          size="s"
          className="h-7 self-start px-3 text-xs"
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
    <ActivityMotionList className="flex flex-col gap-2 p-3">
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
    </ActivityMotionList>
  );
}
