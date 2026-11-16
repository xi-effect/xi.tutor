import { createShapeId, type Editor } from '@ibodr/draw';
import { rollDie, type DiceSides } from '../../dice/diceRoll';
import { DICE_SHAPE_SIZE } from './diceShape';

/** Кладёт кубик в центр текущего вида. Число уже посчитано и хранится в фигуре, поэтому у всех оно одно. */
export function insertDiceShape(editor: Editor, sides: DiceSides): string {
  const bounds = editor.getViewportPageBounds();
  const id = createShapeId();
  const size = DICE_SHAPE_SIZE;

  editor.markHistoryStoppingPoint('throw-dice');
  editor.run(() => {
    editor.createShape({
      id,
      type: 'dice',
      x: bounds.x + bounds.w / 2 - size / 2,
      y: bounds.y + bounds.h / 2 - size / 2,
      props: {
        w: size,
        h: size,
        sides,
        value: rollDie(sides),
        rolledAt: Date.now(),
      },
    });
  });

  return id;
}
