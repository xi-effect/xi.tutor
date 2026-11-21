import { Button } from '@xipkg/button';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { normalizeExerciseDefinition } from '../../model/bankExercise';
import type {
  ActivityAttempt,
  CheckStatus,
  ExerciseDefinition,
  ItemStatus,
} from '../../model/types';
import { toggleAnswerVisibility } from '../../primitives/reset';
import { parseAnswerList } from '../../primitives/text';
import { ActivityInputField, ActivityTextareaField } from '../activityFields';
import { useActivityEventGuard } from '../activityHostContext';
import { ExerciseFigure } from './ExerciseFigure';
import { ExerciseText } from './ExerciseText';

type PlayAccess = {
  canCheck: boolean;
  canReveal: boolean;
  canUseHints: boolean;
};

type Props = {
  definition: ExerciseDefinition;
  attempt: ActivityAttempt;
  checkStatus: CheckStatus;
  byItem?: Record<string, boolean>;
  mode: 'edit' | 'play';
  playAccess?: PlayAccess;
  onDefinition: (definition: ExerciseDefinition) => void;
  onAttempt: (attempt: ActivityAttempt, checkStatus?: CheckStatus) => void;
  onControlAttempt: (attempt: ActivityAttempt, checkStatus?: CheckStatus) => void;
  onCheck?: () => void;
  interactLocked?: boolean;
};

const actionClass = 'h-7 px-3 text-xs';
const textButtonClass = 'text-text-link h-7 px-2 text-xs';

function hintCount(hints: string[], revealed: Record<string, boolean>) {
  return hints.filter((_, index) => revealed[`hint:${index}`]).length;
}

export function ExerciseActivity({
  definition: rawDefinition,
  attempt,
  checkStatus,
  byItem,
  mode,
  playAccess,
  onDefinition,
  onAttempt,
  onControlAttempt,
  onCheck,
  interactLocked = false,
}: Props) {
  const { t } = useTranslation('board');
  const { stop } = useActivityEventGuard();
  const definition = normalizeExerciseDefinition(rawDefinition);
  const answer = attempt.values.answer ?? '';
  const answerOpen = checkStatus === 'revealed' || Boolean(attempt.revealed.answer);
  const solutionOpen = Boolean(attempt.revealed.solution);
  const shownHints = hintCount(definition.hints, attempt.revealed);
  const checkable =
    !definition.openEnded && (definition.accepted.length > 0 || definition.numeric !== null);
  const status: ItemStatus =
    !checkable || checkStatus === 'idle' ? 'idle' : byItem?.answer ? 'correct' : 'wrong';
  const hasAnswer = Boolean(definition.answerDisplay.trim() || definition.rubric.length);
  const canCheck = mode === 'play' && checkable && Boolean(playAccess?.canCheck);
  const canReveal = mode === 'play' && Boolean(playAccess?.canReveal);
  const canUseHints = mode === 'play' && Boolean(playAccess?.canUseHints);

  const patchRevealed = (revealed: Record<string, boolean>, nextStatus = checkStatus) => {
    onControlAttempt({ ...attempt, revealed }, nextStatus);
  };

  if (mode === 'edit') {
    return (
      <div className="border-border-default bg-background-surface flex flex-col gap-3 rounded-xl border-2 p-3">
        {definition.blocks.map((item) => (
          <label key={item.id} className="flex flex-col gap-1">
            <span className="text-text-secondary text-xs">
              {t(`activity.exercise.role.${item.role}`)}
            </span>
            <ActivityTextareaField
              value={item.text}
              onChange={(event) =>
                onDefinition({
                  ...definition,
                  blocks: definition.blocks.map((entry) =>
                    entry.id === item.id ? { ...entry, text: event.target.value } : entry,
                  ),
                })
              }
            />
          </label>
        ))}
        {definition.figure ? <ExerciseFigure figure={definition.figure} /> : null}
        <label className="flex flex-col gap-1">
          <span className="text-text-secondary text-xs">{t('activity.exercise.answer')}</span>
          <ActivityTextareaField
            value={definition.answerDisplay}
            onChange={(event) => onDefinition({ ...definition, answerDisplay: event.target.value })}
          />
        </label>
        {!definition.openEnded ? (
          <label className="flex flex-col gap-1">
            <span className="text-text-secondary text-xs">{t('activity.exercise.accepted')}</span>
            <ActivityInputField
              value={definition.accepted.join(' | ')}
              onChange={(event) =>
                onDefinition({ ...definition, accepted: parseAnswerList(event.target.value) })
              }
            />
          </label>
        ) : null}
        <TextList
          label={t('activity.exercise.hints')}
          addLabel={t('activity.exercise.addHint')}
          items={definition.hints}
          onChange={(hints) => onDefinition({ ...definition, hints })}
        />
        <TextList
          label={t('activity.exercise.solution')}
          addLabel={t('activity.exercise.addStep')}
          items={definition.solution}
          onChange={(solution) => onDefinition({ ...definition, solution })}
        />
        {definition.evidence ? (
          <label className="flex flex-col gap-1">
            <span className="text-text-secondary text-xs">{t('activity.exercise.evidence')}</span>
            <ActivityTextareaField
              value={definition.evidence}
              onChange={(event) => onDefinition({ ...definition, evidence: event.target.value })}
            />
          </label>
        ) : null}
        {definition.rubric.length > 0 ? (
          <TextList
            label={t('activity.exercise.rubric')}
            addLabel={t('activity.exercise.addCriterion')}
            items={definition.rubric}
            onChange={(rubric) => onDefinition({ ...definition, rubric })}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="border-border-default bg-background-surface flex flex-col gap-3 rounded-xl border-2 p-3">
      {definition.blocks.map((item) => (
        <div key={item.id} className="flex flex-col gap-1">
          {item.role !== 'statement' ? (
            <p className="text-text-secondary text-xs">
              {t(`activity.exercise.role.${item.role}`)}
            </p>
          ) : null}
          <p className="text-text-primary text-sm leading-6">
            <ExerciseText text={item.text} />
          </p>
        </div>
      ))}
      {definition.figure ? <ExerciseFigure figure={definition.figure} /> : null}

      <div
        className={cn(
          'rounded-lg',
          status === 'correct' && 'ring-2 ring-green-600',
          status === 'wrong' && 'ring-2 ring-red-600',
        )}
      >
        <ActivityInputField
          value={answer}
          disabled={interactLocked || checkStatus === 'revealed'}
          placeholder={t('activity.exercise.answerPlaceholder')}
          aria-label={t('activity.exercise.answerPlaceholder')}
          onChange={(event) =>
            onAttempt({
              ...attempt,
              values: { ...attempt.values, answer: event.target.value },
              revealed: { ...attempt.revealed, answer: false },
            })
          }
        />
      </div>
      {status !== 'idle' ? (
        <p
          className={cn(
            'text-xs font-medium',
            status === 'correct' ? 'text-green-80' : 'text-red-80',
          )}
        >
          {status === 'correct' ? t('activity.exercise.correct') : t('activity.exercise.wrong')}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-1.5">
        {canCheck ? (
          <Button
            type="button"
            variant="primary"
            size="s"
            className={actionClass}
            data-board-control=""
            onPointerDown={stop}
            onClick={() => onCheck?.()}
          >
            {t('activity.check')}
          </Button>
        ) : null}
        {canReveal && hasAnswer ? (
          <Button
            type="button"
            variant="none"
            size="s"
            className={textButtonClass}
            data-board-control=""
            onPointerDown={stop}
            onClick={() => {
              const next = toggleAnswerVisibility(definition, attempt, checkStatus);
              onControlAttempt(next.attempt, next.checkStatus);
            }}
          >
            {answerOpen
              ? t(definition.openEnded ? 'activity.exercise.hideRubric' : 'activity.hideAnswer')
              : t(definition.openEnded ? 'activity.exercise.showRubric' : 'activity.reveal')}
          </Button>
        ) : null}
        {canUseHints && shownHints < definition.hints.length ? (
          <Button
            type="button"
            variant="none"
            size="s"
            className={textButtonClass}
            data-board-control=""
            onPointerDown={stop}
            onClick={() => patchRevealed({ ...attempt.revealed, [`hint:${shownHints}`]: true })}
          >
            {definition.hints.length > 1
              ? t('activity.exercise.hintN', { n: shownHints + 1 })
              : t('activity.exercise.hint')}
          </Button>
        ) : null}
        {canUseHints && shownHints > 0 ? (
          <Button
            type="button"
            variant="none"
            size="s"
            className={textButtonClass}
            data-board-control=""
            onPointerDown={stop}
            onClick={() => {
              const revealed = { ...attempt.revealed };
              definition.hints.forEach((_, index) => {
                delete revealed[`hint:${index}`];
              });
              patchRevealed(revealed);
            }}
          >
            {t('activity.exercise.hideHints')}
          </Button>
        ) : null}
        {canReveal && (definition.solution.length > 0 || definition.evidence) ? (
          <Button
            type="button"
            variant="none"
            size="s"
            className={textButtonClass}
            data-board-control=""
            onPointerDown={stop}
            onClick={() => patchRevealed({ ...attempt.revealed, solution: !solutionOpen })}
          >
            {solutionOpen
              ? t('activity.exercise.hideSolution')
              : t('activity.exercise.showSolution')}
          </Button>
        ) : null}
      </div>

      {shownHints > 0 ? (
        <div className="bg-background-subtle flex flex-col gap-2 rounded-xl p-3">
          <p className="text-text-secondary text-xs">{t('activity.exercise.hints')}</p>
          {definition.hints.slice(0, shownHints).map((hint, index) => (
            <div key={`${index}-${hint}`} className="flex gap-2">
              {definition.hints.length > 1 ? (
                <span className="bg-status-info-background text-text-primary flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                  {index + 1}
                </span>
              ) : null}
              <p className="text-text-primary min-w-0 flex-1 text-sm leading-5">
                <ExerciseText text={hint} />
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {answerOpen && hasAnswer ? (
        <div className="bg-background-subtle flex flex-col gap-2 rounded-xl p-3">
          <p className="text-text-secondary text-xs">
            {t(definition.openEnded ? 'activity.exercise.rubric' : 'activity.exercise.answer')}
          </p>
          {definition.wordRange ? (
            <p className="text-text-secondary text-sm">
              {t('activity.exercise.wordRange', {
                min: definition.wordRange.min,
                max: definition.wordRange.max,
              })}
            </p>
          ) : null}
          {definition.answerDisplay ? (
            <p className="text-text-primary text-sm leading-6">
              <ExerciseText text={definition.answerDisplay} />
            </p>
          ) : null}
          {definition.rubric.length > 0 ? (
            <ul className="text-text-primary flex list-disc flex-col gap-1 pl-5 text-sm">
              {definition.rubric.map((line) => (
                <li key={line}>
                  <ExerciseText text={line} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {solutionOpen ? (
        <div className="bg-background-subtle flex flex-col gap-2 rounded-xl p-3">
          <p className="text-text-secondary text-xs">{t('activity.exercise.solution')}</p>
          {definition.solution.length === 1 ? (
            <p className="text-text-primary text-sm leading-6">
              <ExerciseText text={definition.solution[0] ?? ''} />
            </p>
          ) : (
            <ol className="text-text-primary flex list-decimal flex-col gap-2 pl-5 text-sm">
              {definition.solution.map((step, index) => (
                <li key={`${index}-${step}`} className="pl-1">
                  <ExerciseText text={step} />
                </li>
              ))}
            </ol>
          )}
          {definition.evidence ? (
            <p className="text-text-secondary text-sm leading-5">
              <ExerciseText text={definition.evidence} />
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function TextList({
  label,
  addLabel,
  items,
  onChange,
}: {
  label: string;
  addLabel: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const { t } = useTranslation('board');

  return (
    <div className="flex flex-col gap-1">
      <span className="text-text-secondary text-xs">{label}</span>
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-1">
          <ActivityTextareaField
            value={item}
            onChange={(event) => {
              const next = [...items];
              next[index] = event.target.value;
              onChange(next);
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="s"
            className="h-7 shrink-0 px-2 text-xs"
            data-board-control=""
            onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
          >
            {t('activity.removeItem')}
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="default"
        size="s"
        className="h-7 self-start px-3 text-xs"
        data-board-control=""
        onClick={() => onChange([...items, ''])}
      >
        {addLabel}
      </Button>
    </div>
  );
}
