import { useEditor } from '@ibodr/draw';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { DICE_SIDES } from '../../../dice/diceRoll';
import { insertDiceShape } from '../../../shapes/dice';

type DicePickerProps = {
  className?: string;
  onClose?: () => void;
};

export function DicePicker({ className, onClose }: DicePickerProps) {
  const { t } = useTranslation('board');
  const editor = useEditor();

  return (
    <div
      className={cn(
        'border-border-default bg-background-surface flex w-max max-w-[calc(100vw-3rem)] items-center gap-0.5 rounded-xl border p-1',
        className,
      )}
    >
      {DICE_SIDES.map((sides) => (
        <button
          key={sides}
          type="button"
          className="text-text-primary hover:text-text-link focus-visible:ring-border-focus h-8 min-w-8 appearance-none bg-transparent px-1.5 text-sm font-semibold tabular-nums shadow-none transition-colors focus-visible:ring-2"
          aria-label={t('dice.throwFace', { faces: t(`dice.faces.${sides}`) })}
          title={t(`dice.faces.${sides}`)}
          data-board-dice-option={sides}
          data-umami-event="board-dice-roll"
          data-umami-event-sides={sides}
          onClick={() => {
            insertDiceShape(editor, sides);
            onClose?.();
          }}
        >
          {sides}
        </button>
      ))}
    </div>
  );
}
