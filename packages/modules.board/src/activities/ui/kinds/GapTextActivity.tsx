import { useRef, useState } from 'react';
import { Button } from '@xipkg/button';
import { Radio, RadioItem } from '@xipkg/radio';
import { Trash } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { createActivityId } from '../../model/ids';
import type {
  ActivityAttempt,
  ActivityGap,
  CheckStatus,
  GapInputMode,
  GapTextDefinition,
} from '../../model/types';
import { parseGapSourceText } from '../../primitives/text';
import { ActivityInput, Choice, DraggableToken, DropZone } from '../primitives';
import { ActivityInputField, ActivityTextareaField } from '../activityFields';
import { itemStatus } from '../../primitives/itemStatus';
import { ActivityMotionList } from '../activityUiMotion';
import { boardIconClass } from '../../../ui/boardTheme';

type Props = {
  definition: GapTextDefinition;
  attempt: ActivityAttempt;
  checkStatus: CheckStatus;
  byItem: Record<string, boolean>;
  mode: 'edit' | 'play';
  onDefinition: (definition: GapTextDefinition) => void;
  onAttempt: (attempt: ActivityAttempt) => void;
  interactLocked?: boolean;
};

const GAP_MODES: GapInputMode[] = ['input', 'choice', 'drag'];

function toDisplaySource(sourceText: string, gaps: ActivityGap[]) {
  let text = sourceText;
  gaps.forEach((gap, index) => {
    text = text.split(`{{${gap.id}}}`).join(`{{${index + 1}}}`);
  });
  return text;
}

function fromDisplaySource(displayText: string, gaps: ActivityGap[]) {
  let text = displayText;
  for (let index = gaps.length; index >= 1; index -= 1) {
    const gap = gaps[index - 1];
    if (!gap) continue;
    text = text.split(`{{${index}}}`).join(`{{${gap.id}}}`);
  }
  return text;
}

function ChipRow({ values, onRemove }: { values: string[]; onRemove: (index: number) => void }) {
  if (!values.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {values.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className="bg-status-info-background text-text-link inline-flex max-w-full items-center gap-0.5 rounded-md py-0.5 pr-0.5 pl-2 text-xs font-medium"
        >
          <span className="min-w-0 truncate">{value}</span>
          <button
            type="button"
            data-board-control=""
            className="hover:bg-background-hover flex size-5 shrink-0 items-center justify-center rounded"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onRemove(index)}
            aria-label="×"
          >
            <span className="text-text-secondary text-[11px] leading-none">✕</span>
          </button>
        </span>
      ))}
    </div>
  );
}

function AddOnEnter({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (value: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const commit = () => {
    const next = draft.trim();
    if (!next) return;
    onAdd(next);
    setDraft('');
  };

  return (
    <ActivityInputField
      value={draft}
      placeholder={placeholder}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          commit();
        }
      }}
      onBlur={commit}
    />
  );
}

export function GapTextActivity({
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
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const locked = checkStatus === 'revealed' || interactLocked;

  const createGap = () => {
    const area = areaRef.current;
    if (!area) return;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const display = toDisplaySource(definition.sourceText, definition.gaps);
    const selected = display.slice(start, end).trim();
    if (!selected || /\{\{\d+\}\}/.test(selected)) return;

    const id = createActivityId();
    const nextGaps: ActivityGap[] = [
      ...definition.gaps,
      {
        id,
        answers: [selected],
        input: 'input',
        choices: [],
      },
    ];
    const nextDisplay = `${display.slice(0, start)}{{${nextGaps.length}}}${display.slice(end)}`;
    onDefinition({
      ...definition,
      sourceText: fromDisplaySource(nextDisplay, nextGaps),
      gaps: nextGaps,
    });
  };

  const removeGap = (gapId: string) => {
    onDefinition({
      ...definition,
      sourceText: definition.sourceText.split(`{{${gapId}}}`).join(''),
      gaps: definition.gaps.filter((gap) => gap.id !== gapId),
    });
  };

  const patchGap = (gapId: string, patch: Partial<ActivityGap>) => {
    onDefinition({
      ...definition,
      gaps: definition.gaps.map((gap) => (gap.id === gapId ? { ...gap, ...patch } : gap)),
    });
  };

  if (mode === 'edit') {
    const displaySource = toDisplaySource(definition.sourceText, definition.gaps);
    const hasDragGaps = definition.gaps.some((gap) => gap.input === 'drag');
    const modeLabel: Record<GapInputMode, string> = {
      input: t('activity.gapInput'),
      choice: t('activity.gapChoice'),
      drag: t('activity.gapDrag'),
    };

    return (
      <div className="flex flex-col gap-3 p-3">
        <div className="flex flex-col gap-1.5">
          <ActivityTextareaField
            ref={areaRef}
            className="min-h-16"
            value={displaySource}
            onChange={(event) => {
              const nextSource = fromDisplaySource(event.target.value, definition.gaps);
              const nextGaps = definition.gaps.filter((gap) =>
                nextSource.includes(`{{${gap.id}}}`),
              );
              onDefinition({
                ...definition,
                sourceText: nextSource,
                gaps: nextGaps,
              });
            }}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="s"
              className="h-7 px-3 text-xs"
              data-board-control=""
              onClick={createGap}
            >
              {t('activity.makeGap')}
            </Button>
            <p className="text-text-secondary text-xs">{t('activity.gapHintShort')}</p>
          </div>
        </div>

        {definition.gaps.map((gap, index) => {
          const correct = gap.answers[0] ?? '';
          const choiceOptions =
            gap.choices.length > 0 ? gap.choices : gap.answers.length > 0 ? gap.answers : [''];

          return (
            <div key={gap.id} className="border-border-default flex flex-col gap-2 border-t pt-3">
              <div className="flex items-center gap-2">
                <span className="text-text-secondary w-4 shrink-0 text-center text-xs font-semibold tabular-nums">
                  {index + 1}
                </span>
                <div className="bg-background-subtle flex min-w-0 flex-1 gap-0.5 rounded-lg p-0.5">
                  {GAP_MODES.map((input) => (
                    <button
                      key={input}
                      type="button"
                      data-board-control=""
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={() => {
                        if (input === 'choice') {
                          const options =
                            gap.choices.length > 0
                              ? gap.choices
                              : gap.answers.length > 0
                                ? [...gap.answers, t('activity.option')]
                                : [correct || t('activity.option'), t('activity.option')];
                          patchGap(gap.id, {
                            input,
                            choices: options,
                            answers: [options[0] ?? ''],
                          });
                          return;
                        }
                        patchGap(gap.id, { input });
                      }}
                      className={cn(
                        'h-6 flex-1 rounded-md px-1.5 text-[11px] font-medium transition-colors',
                        gap.input === input
                          ? 'bg-background-surface text-text-primary shadow-sm'
                          : 'text-text-secondary hover:text-text-primary',
                      )}
                    >
                      {modeLabel[input]}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  data-board-control=""
                  title={t('activity.removeGap')}
                  aria-label={t('activity.removeGap')}
                  className="text-text-secondary hover:bg-background-hover hover:text-text-primary flex size-7 shrink-0 items-center justify-center rounded-lg p-0"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => removeGap(gap.id)}
                >
                  <Trash className={cn('size-4', boardIconClass)} />
                </button>
              </div>

              {gap.input === 'choice' ? (
                <div className="flex flex-col gap-1.5 pl-6">
                  <p className="text-text-secondary text-xs">{t('activity.gapChoiceHint')}</p>
                  <Radio
                    value={String(
                      Math.max(
                        0,
                        choiceOptions.findIndex((option) => option === correct),
                      ),
                    )}
                    onValueChange={(value) => {
                      const optionIndex = Number(value);
                      patchGap(gap.id, { answers: [choiceOptions[optionIndex] ?? ''] });
                    }}
                    className="flex flex-col gap-1"
                    data-board-control=""
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    {choiceOptions.map((option, optionIndex) => (
                      <div key={`${gap.id}-${optionIndex}`} className="flex items-center gap-1">
                        <RadioItem value={String(optionIndex)} />
                        <ActivityInputField
                          value={option}
                          onChange={(event) => {
                            const next = [...choiceOptions];
                            next[optionIndex] = event.target.value;
                            const selectedIndex = choiceOptions.findIndex(
                              (entry) => entry === correct,
                            );
                            patchGap(gap.id, {
                              choices: next,
                              answers: [
                                next[selectedIndex >= 0 ? selectedIndex : optionIndex] ?? '',
                              ],
                            });
                          }}
                        />
                        <button
                          type="button"
                          data-board-control=""
                          disabled={choiceOptions.length <= 1}
                          className="text-text-secondary hover:text-text-primary flex size-7 shrink-0 items-center justify-center rounded-lg disabled:opacity-30"
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={() => {
                            const next = choiceOptions.filter((_, i) => i !== optionIndex);
                            const selectedIndex = choiceOptions.findIndex(
                              (entry) => entry === correct,
                            );
                            let nextCorrect = correct;
                            if (selectedIndex === optionIndex) nextCorrect = next[0] ?? '';
                            else if (selectedIndex > optionIndex) {
                              nextCorrect = next[selectedIndex - 1] ?? '';
                            }
                            patchGap(gap.id, {
                              choices: next,
                              answers: [nextCorrect],
                            });
                          }}
                        >
                          <Trash className={cn('size-3.5', boardIconClass)} />
                        </button>
                      </div>
                    ))}
                  </Radio>
                  <Button
                    type="button"
                    variant="ghost"
                    size="s"
                    className="text-text-link h-7 self-start px-2 text-xs"
                    data-board-control=""
                    onClick={() =>
                      patchGap(gap.id, {
                        choices: [...choiceOptions, ''],
                      })
                    }
                  >
                    {t('activity.addOption')}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 pl-6">
                  <ActivityInputField
                    value={correct}
                    placeholder={t('activity.gapAnswerPlaceholder')}
                    onChange={(event) => {
                      const next = event.target.value;
                      const rest = gap.answers.slice(1);
                      patchGap(gap.id, { answers: next ? [next, ...rest] : rest });
                    }}
                  />
                  {gap.answers.length > 1 ? (
                    <ChipRow
                      values={gap.answers.slice(1)}
                      onRemove={(chipIndex) =>
                        patchGap(gap.id, {
                          answers: gap.answers.filter((_, i) => i !== chipIndex + 1),
                        })
                      }
                    />
                  ) : null}
                  <AddOnEnter
                    placeholder={t('activity.gapSynonymPlaceholder')}
                    onAdd={(value) => {
                      if (gap.answers.includes(value)) return;
                      const base = gap.answers[0] ? gap.answers : [];
                      patchGap(gap.id, { answers: [...base, value] });
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}

        {hasDragGaps ? (
          <div className="border-border-default flex flex-col gap-1.5 border-t pt-3">
            <p className="text-text-secondary text-xs">{t('activity.wordBankLabel')}</p>
            <ChipRow
              values={definition.bank}
              onRemove={(index) =>
                onDefinition({
                  ...definition,
                  bank: definition.bank.filter((_, itemIndex) => itemIndex !== index),
                })
              }
            />
            <AddOnEnter
              placeholder={t('activity.wordBankPlaceholder')}
              onAdd={(value) => {
                if (definition.bank.includes(value)) return;
                onDefinition({ ...definition, bank: [...definition.bank, value] });
              }}
            />
          </div>
        ) : null}
      </div>
    );
  }

  const segments = parseGapSourceText(definition.sourceText);
  const gapById = new Map(definition.gaps.map((gap) => [gap.id, gap]));
  const placedTokenIds = new Set(Object.values(attempt.placements).filter(Boolean));
  const hasDragGaps = definition.gaps.some((gap) => gap.input === 'drag');
  const dragTokens = hasDragGaps
    ? [
        ...definition.gaps
          .filter((gap) => gap.input === 'drag')
          .map((gap) => ({ id: gap.id, label: gap.answers[0] ?? gap.id })),
        ...definition.bank.map((word, index) => ({ id: `bank-${index}`, label: word })),
      ].filter((token) => !placedTokenIds.has(token.id))
    : [];

  return (
    <ActivityMotionList className="flex flex-col gap-3 p-3">
      <div className="text-text-primary text-sm leading-7">
        {segments.map((segment, index) => {
          if (segment.type === 'text') {
            return <span key={`t-${index}`}>{segment.text}</span>;
          }
          const gap = gapById.get(segment.id);
          if (!gap) return <span key={segment.id}>{`{{${segment.id}}}`}</span>;
          const status = itemStatus(checkStatus, byItem, gap.id);
          if (gap.input === 'choice') {
            return (
              <Choice
                key={gap.id}
                value={attempt.values[gap.id] ?? ''}
                options={gap.choices.length ? gap.choices : gap.answers}
                disabled={locked}
                status={status}
                onChange={(value) =>
                  onAttempt({ ...attempt, values: { ...attempt.values, [gap.id]: value } })
                }
              />
            );
          }
          if (gap.input === 'drag') {
            const placed = attempt.placements[gap.id];
            const token = [
              ...definition.gaps.map((item) => ({
                id: item.id,
                label: item.answers[0] ?? item.id,
              })),
              ...definition.bank.map((word, tokenIndex) => ({
                id: `bank-${tokenIndex}`,
                label: word,
              })),
            ].find((item) => item.id === placed);
            return (
              <span key={gap.id} className="inline-flex align-middle">
                <DropZone
                  zoneId={gap.id}
                  label={t('activity.dropHere')}
                  status={status}
                  disabled={locked}
                  child={
                    token ? (
                      <DraggableToken id={token.id} label={token.label} disabled={locked} />
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
              </span>
            );
          }
          return (
            <ActivityInput
              key={gap.id}
              value={attempt.values[gap.id] ?? ''}
              disabled={locked}
              status={status}
              onChange={(value) =>
                onAttempt({ ...attempt, values: { ...attempt.values, [gap.id]: value } })
              }
            />
          );
        })}
      </div>
      {dragTokens.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {dragTokens.map((token) => (
            <DraggableToken key={token.id} id={token.id} label={token.label} disabled={locked} />
          ))}
        </div>
      )}
    </ActivityMotionList>
  );
}
