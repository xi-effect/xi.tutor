import { createShapeId, type Editor } from '@ibodr/draw';
import type { MathTaskSearchDocument } from 'features.bank';
import { loadBankExercise } from '../activities/model/bankExercise';
import { createEmptyAttempt } from '../activities/model/defaults';
import { ACTIVITY_DEFAULT_SIZE } from '../activities/model/kinds';
import { getActivityDefaultProps } from '../activities/shape/ActivityShape';

export async function insertMathTaskToBoard(
  editor: Editor,
  task: MathTaskSearchDocument,
): Promise<string> {
  const loaded = await loadBankExercise(task);
  const size = ACTIVITY_DEFAULT_SIZE.exercise;
  const bounds = editor.getViewportPageBounds();
  const id = createShapeId();

  editor.markHistoryStoppingPoint('insert-math-bank-task');
  editor.run(() => {
    editor.createShape({
      id,
      type: 'activity',
      x: bounds.x + bounds.w / 2 - size.w / 2,
      y: bounds.y + bounds.h / 2 - size.h / 2,
      props: {
        ...getActivityDefaultProps('exercise'),
        w: size.w,
        h: size.h,
        title: loaded.title,
        definition: loaded.definition,
        attempt: createEmptyAttempt(loaded.definition),
      },
    });
    editor.setSelectedShapes([id]);
    editor.setCurrentTool('select');
  });

  return id;
}
