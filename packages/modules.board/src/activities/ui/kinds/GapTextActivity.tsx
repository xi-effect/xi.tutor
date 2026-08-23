import { useRef } from 'react';
import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';
import { createActivityId } from '../../model/ids';
import type {
  ActivityAttempt,
  CheckStatus,
  GapInputMode,
  GapTextDefinition,
} from '../../model/types';
import { parseGapSourceText } from '../../primitives/text';
import { ActivityInput, Choice, DraggableToken, DropZone } from '../primitives';
import {
  ActivityDraftInputField,
  ActivitySelectField,
  ActivityTextareaField,
} from '../activityFields';
import { itemStatus } from '../../primitives/itemStatus';
import { ActivityMotionList } from '../activityUiMotion';

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

  const createGap = (input: GapInputMode) => {
    const area = areaRef.current;
    if (!area) return;
    const start = area.selectionStart;
    const end = area.selectionEnd;
    const selected = definition.sourceText.slice(start, end).trim();
    if (!selected) return;
    const id = createActivityId();
    onDefinition({
      ...definition,
      sourceText: `${definition.sourceText.slice(0, start)}{{${id}}}${definition.sourceText.slice(end)}`,
      gaps: [
        ...definition.gaps,
        {
          id,
          answers: [selected],
          input,
          choices: input === 'choice' ? [selected] : [],
        },
      ],
    });
  };

  if (mode === 'edit') {
    const hasDragGaps = definition.gaps.some((gap) => gap.input === 'drag');

    return (
      <div className="flex flex-col gap-3 p-3">
        <ActivityTextareaField
          ref={areaRef}
          className="min-h-24"
          value={definition.sourceText}
          onChange={(event) => onDefinition({ ...definition, sourceText: event.target.value })}
        />
        <p className="text-text-secondary text-xs">{t('activity.gapHint')}</p>
        <div className="flex flex-wrap gap-1">
          <Button
            variant="default"
            size="s"
            className="h-7 px-3 text-xs"
            data-board-control=""
            onClick={() => createGap('input')}
          >
            {t('activity.gapInput')}
          </Button>
          <Button
            variant="secondary"
            size="s"
            className="h-7 px-3 text-xs"
            data-board-control=""
            onClick={() => createGap('choice')}
          >
            {t('activity.gapChoice')}
          </Button>
          <Button
            variant="secondary"
            size="s"
            className="h-7 px-3 text-xs"
            data-board-control=""
            onClick={() => createGap('drag')}
          >
            {t('activity.gapDrag')}
          </Button>
        </div>
        {definition.gaps.map((gap, index) => (
          <div key={gap.id} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-text-secondary shrink-0 text-xs">
                {t('activity.gapN', { n: index + 1 })}
              </span>
              <ActivitySelectField
                value={gap.input}
                className="w-auto min-w-32"
                options={[
                  { value: 'input', label: t('activity.gapInput') },
                  { value: 'choice', label: t('activity.gapChoice') },
                  { value: 'drag', label: t('activity.gapDrag') },
                ]}
                onValueChange={(input) => {
                  if (input !== 'input' && input !== 'choice' && input !== 'drag') return;
                  onDefinition({
                    ...definition,
                    gaps: definition.gaps.map((item) =>
                      item.id === gap.id
                        ? {
                            ...item,
                            input,
                            choices:
                              input === 'choice' && item.choices.length === 0
                                ? item.answers
                                : item.choices,
                          }
                        : item,
                    ),
                  });
                }}
              />
            </div>
            <ActivityDraftInputField
              placeholder={t('activity.gapAnswers')}
              value={gap.answers.join(' | ')}
              onCommit={(text) =>
                onDefinition({
                  ...definition,
                  gaps: definition.gaps.map((item) =>
                    item.id === gap.id
                      ? {
                          ...item,
                          answers: text
                            .split('|')
                            .map((part) => part.trim())
                            .filter(Boolean),
                        }
                      : item,
                  ),
                })
              }
            />
            {gap.input === 'choice' && (
              <ActivityDraftInputField
                placeholder={t('activity.choices')}
                value={gap.choices.join(' | ')}
                onCommit={(text) =>
                  onDefinition({
                    ...definition,
                    gaps: definition.gaps.map((item) =>
                      item.id === gap.id
                        ? {
                            ...item,
                            choices: text
                              .split('|')
                              .map((part) => part.trim())
                              .filter(Boolean),
                          }
                        : item,
                    ),
                  })
                }
              />
            )}
          </div>
        ))}
        {hasDragGaps && (
          <ActivityDraftInputField
            placeholder={t('activity.wordBank')}
            value={definition.bank.join(' | ')}
            onCommit={(text) =>
              onDefinition({
                ...definition,
                bank: text
                  .split('|')
                  .map((part) => part.trim())
                  .filter(Boolean),
              })
            }
          />
        )}
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
