import { Button } from '@xipkg/button';
import { Checkbox } from '@xipkg/checkbox';
import { Radio, RadioItem } from '@xipkg/radio';
import { useTranslation } from 'react-i18next';
import { createActivityId } from '../../model/ids';
import { normalizeMultipleChoiceDefinition } from '../../model/multipleChoice';
import type {
  ActivityAttempt,
  CheckStatus,
  ChoiceOption,
  ItemStatus,
  MultipleChoiceDefinition,
} from '../../model/types';
import { Selectable } from '../primitives';
import { ActivityInputField, ActivityTextareaField } from '../activityFields';
import { ActivityMotionList } from '../activityUiMotion';

type Props = {
  definition: MultipleChoiceDefinition;
  attempt: ActivityAttempt;
  checkStatus: CheckStatus;
  byItem?: Record<string, boolean>;
  mode: 'edit' | 'play';
  onDefinition: (definition: MultipleChoiceDefinition) => void;
  onAttempt: (attempt: ActivityAttempt) => void;
  interactLocked?: boolean;
};

function optionPlayStatus(
  option: ChoiceOption,
  selected: boolean,
  checkStatus: CheckStatus,
  multiple: boolean,
): ItemStatus {
  if (checkStatus === 'idle') return 'idle';

  if (checkStatus === 'revealed') {
    if (option.correct) return 'correct';
    if (selected) return 'wrong';
    return 'idle';
  }

  // checked
  if (multiple) {
    if (option.correct && selected) return 'correct';
    if (option.correct && !selected) return 'wrong';
    if (!option.correct && selected) return 'wrong';
    return 'idle';
  }

  if (selected && option.correct) return 'correct';
  if (selected && !option.correct) return 'wrong';
  return 'idle';
}

export function MultipleChoiceActivity({
  definition,
  attempt,
  checkStatus,
  mode,
  onDefinition,
  onAttempt,
  interactLocked = false,
}: Props) {
  const { t } = useTranslation('board');
  const locked = checkStatus === 'revealed' || interactLocked;
  const playDefinition = normalizeMultipleChoiceDefinition(definition);
  const optionIds = attempt.optionOrder.length
    ? attempt.optionOrder
    : playDefinition.options.map((option) => option.id);
  const optionsById = new Map(playDefinition.options.map((option) => [option.id, option]));

  const commitDefinition = (next: MultipleChoiceDefinition) => {
    onDefinition(normalizeMultipleChoiceDefinition(next));
  };

  if (mode === 'edit') {
    return (
      <div className="flex flex-col gap-2 p-3">
        <ActivityTextareaField
          value={definition.question}
          onChange={(event) => commitDefinition({ ...definition, question: event.target.value })}
        />
        {definition.multiple ? (
          definition.options.map((option) => (
            <div key={option.id} className="flex items-center gap-1">
              <Checkbox
                size="s"
                data-board-control=""
                checked={option.correct}
                onCheckedChange={() =>
                  commitDefinition({
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
                  commitDefinition({
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
              commitDefinition({
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
                    commitDefinition({
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
          onClick={() => {
            const id = createActivityId();
            commitDefinition({
              ...definition,
              options: [...definition.options, { id, text: t('activity.option'), correct: false }],
            });
            if (attempt.optionOrder.length > 0) {
              onAttempt({ ...attempt, optionOrder: [...attempt.optionOrder, id] });
            }
          }}
        >
          {t('activity.addOption')}
        </Button>
      </div>
    );
  }

  return (
    <ActivityMotionList className="flex flex-col gap-2 p-3">
      <p className="text-text-primary text-sm font-medium">{playDefinition.question}</p>
      {optionIds.map((id) => {
        const option = optionsById.get(id);
        if (!option) return null;
        const selected = Boolean(attempt.selected[option.id]);
        const status = optionPlayStatus(option, selected, checkStatus, playDefinition.multiple);
        return (
          <Selectable
            key={option.id}
            selected={selected}
            status={status}
            disabled={locked}
            onToggle={() => {
              const next = playDefinition.multiple
                ? { ...attempt.selected, [option.id]: !selected }
                : Object.fromEntries(
                    playDefinition.options.map((entry) => [entry.id, entry.id === option.id]),
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
