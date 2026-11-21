import type { Editor, JSONContent } from '@tiptap/core';
import {
  createEmptyAttempt,
  DEFAULT_ACTIVITY_STUDENT_ACCESS,
  loadBankExercise,
  type ExerciseDefinition,
} from 'modules.board/activities';
import type { ActiveBlockT } from '../types';
import { insertContentRelativeToBlock } from './insertContentRelativeToBlock';

function createExerciseBlock(definition: ExerciseDefinition, title: string): JSONContent {
  return {
    type: 'activity',
    attrs: {
      kind: 'exercise',
      title,
      definition: JSON.stringify(definition),
      attempt: JSON.stringify(createEmptyAttempt(definition)),
      checkStatus: 'idle',
      studentAccess: JSON.stringify(DEFAULT_ACTIVITY_STUDENT_ACCESS),
    },
  };
}

export async function insertMathTaskToEditor(
  editor: Editor | null,
  task: Parameters<typeof loadBankExercise>[0],
  activeBlock?: ActiveBlockT,
): Promise<boolean> {
  if (!editor) return false;

  const loaded = await loadBankExercise(task);
  return insertContentRelativeToBlock(
    editor,
    createExerciseBlock(loaded.definition, loaded.title),
    activeBlock,
  );
}
