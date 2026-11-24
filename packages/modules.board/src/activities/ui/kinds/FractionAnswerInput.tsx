import { cn } from '@xipkg/utils';
import type { KeyboardEvent, PointerEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { sanitizeFractionPart } from '../../model/fractionAnswer';
import { useActivityEventGuard } from '../activityHostContext';

type FractionAnswerInputProps = {
  numerator: string;
  denominator: string;
  disabled?: boolean;
  onNumerator: (value: string) => void;
  onDenominator: (value: string) => void;
};

export function FractionAnswerInput({
  numerator,
  denominator,
  disabled = false,
  onNumerator,
  onDenominator,
}: FractionAnswerInputProps) {
  const { t } = useTranslation('board');
  const { stop } = useActivityEventGuard();

  const guard = {
    onPointerDown: (event: PointerEvent) => stop(event),
    onKeyDown: (event: KeyboardEvent) => stop(event),
  };

  const fieldClass =
    'text-text-primary placeholder:text-text-secondary w-full bg-transparent px-2 py-1.5 text-center text-sm outline-none';

  return (
    <div
      className="border-border-default bg-background-surface rounded-lg border px-4 py-2"
      data-board-control=""
    >
      <div className={cn('mx-auto flex w-full max-w-52 flex-col', disabled && 'opacity-60')}>
        <input
          value={numerator}
          disabled={disabled}
          inputMode="text"
          autoComplete="off"
          aria-label={t('activity.exercise.numerator')}
          placeholder={t('activity.exercise.numerator')}
          className={fieldClass}
          onChange={(event) => onNumerator(sanitizeFractionPart(event.target.value))}
          {...guard}
        />
        <div className="text-text-primary mx-2 border-t-2 border-current" />
        <input
          value={denominator}
          disabled={disabled}
          inputMode="text"
          autoComplete="off"
          aria-label={t('activity.exercise.denominator')}
          placeholder={t('activity.exercise.denominator')}
          className={fieldClass}
          onChange={(event) => onDenominator(sanitizeFractionPart(event.target.value))}
          {...guard}
        />
      </div>
    </div>
  );
}
