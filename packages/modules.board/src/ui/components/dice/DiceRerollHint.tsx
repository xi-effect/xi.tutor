import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { track, useEditor, type DrShapeId } from '@ibodr/draw';
import { Button } from '@xipkg/button';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import {
  dismissDiceRerollHint,
  DICE_REROLL_HINT_STORAGE_KEY,
  isDiceRerollHintDismissed,
  pickVisibleDiceId,
  placeDiceHint,
  type DiceHintSide,
} from '../../../shapes/dice/diceHint';
import { useBoardChrome } from '../../useBoardChrome';

const POPUP_WIDTH = 272;
const POPUP_HEIGHT = 124;
const POPUP_GAP = 14;

const caretClass: Record<DiceHintSide, string> = {
  right: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2',
  left: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2',
  bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
  top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
};

/** Подсказка у кубика для тех, кто ещё не скрыл её кнопкой «Понятно». */
export const DiceRerollHint = track(function DiceRerollHint() {
  const editor = useEditor();
  const { t } = useTranslation('board');
  const { insets } = useBoardChrome();
  const [dismissed, setDismissed] = useState(true);
  const anchorId = useRef<DrShapeId | null>(null);

  useEffect(() => {
    setDismissed(isDiceRerollHintDismissed());

    const onStorage = (event: StorageEvent) => {
      if (event.key !== DICE_REROLL_HINT_STORAGE_KEY) return;
      setDismissed(isDiceRerollHintDismissed());
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const dismiss = () => {
    dismissDiceRerollHint();
    setDismissed(true);
  };

  if (dismissed) return null;

  const viewportPage = editor.getViewportPageBounds();
  const dice = editor
    .getCurrentPageShapes()
    .filter((shape) => shape.type === 'dice')
    .map((shape) => {
      const bounds = editor.getShapePageBounds(shape);
      return {
        id: shape.id,
        bounds: bounds ? { x: bounds.x, y: bounds.y, w: bounds.w, h: bounds.h } : null,
      };
    });
  const diceId = pickVisibleDiceId(
    dice,
    { x: viewportPage.x, y: viewportPage.y, w: viewportPage.w, h: viewportPage.h },
    anchorId.current,
  );
  if (!diceId) return null;
  anchorId.current = diceId;

  const pageBounds = editor.getShapePageBounds(diceId);
  if (!pageBounds) return null;

  const topLeft = editor.pageToViewport({ x: pageBounds.minX, y: pageBounds.minY });
  const bottomRight = editor.pageToViewport({ x: pageBounds.maxX, y: pageBounds.maxY });
  const screen = editor.getViewportScreenBounds();
  const popupWidth = Math.min(POPUP_WIDTH, Math.max(180, screen.w - insets.left - insets.right));
  const place = placeDiceHint(
    {
      x: topLeft.x,
      y: topLeft.y,
      w: bottomRight.x - topLeft.x,
      h: bottomRight.y - topLeft.y,
    },
    { w: screen.w, h: screen.h },
    { w: popupWidth, h: POPUP_HEIGHT },
    POPUP_GAP,
    insets,
  );

  const keepOnHint = (event: PointerEvent<HTMLDivElement>) => {
    editor.markEventAsHandled(event);
    event.stopPropagation();
  };

  return (
    <div
      className="pointer-events-auto absolute z-40"
      style={{ left: place.left, top: place.top, width: popupWidth }}
      data-board-dice-hint=""
      data-board-dice-hint-side={place.side}
      role="note"
      onPointerDown={keepOnHint}
      onPointerUp={keepOnHint}
    >
      <span
        aria-hidden
        className={cn(
          'border-border-default bg-background-surface absolute z-0 size-2.5 rotate-45 border',
          caretClass[place.side],
        )}
      />
      <div className="border-border-default bg-background-surface text-text-primary relative z-10 rounded-xl border p-3 shadow-md">
        <p className="text-sm leading-5">{t('dice.rerollHint')}</p>
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            variant="primary"
            size="s"
            className="h-7 px-3 text-xs"
            data-board-dice-hint-dismiss=""
            onClick={dismiss}
          >
            {t('dice.rerollHintDismiss')}
          </Button>
        </div>
      </div>
    </div>
  );
});
