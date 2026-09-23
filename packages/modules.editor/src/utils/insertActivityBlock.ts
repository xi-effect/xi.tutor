import type { Editor, JSONContent } from '@tiptap/core';
import {
  createEmptyAttempt,
  DEFAULT_ACTIVITY_STUDENT_ACCESS,
  getDefaultDefinition,
  type ActivityKind,
} from 'modules.board/activities';
import type { ActiveBlockT } from '../types';
import { insertContentRelativeToBlock } from './insertContentRelativeToBlock';
import { getCurrentBlock } from './getCurrentBlock';

export function createActivityBlock(kind: ActivityKind): JSONContent {
  const definition = getDefaultDefinition(kind);
  return {
    type: 'activity',
    attrs: {
      kind,
      title: '',
      definition: JSON.stringify(definition),
      attempt: JSON.stringify(createEmptyAttempt(definition)),
      checkStatus: 'idle',
      studentAccess: JSON.stringify(DEFAULT_ACTIVITY_STUDENT_ACCESS),
    },
  };
}

export function insertActivityBlock(
  editor: Editor | null,
  kind: ActivityKind,
  activeBlock?: ActiveBlockT,
) {
  if (!editor?.isEditable) return;
  insertContentRelativeToBlock(
    editor,
    createActivityBlock(kind),
    getCurrentBlock(editor, activeBlock),
  );
}
