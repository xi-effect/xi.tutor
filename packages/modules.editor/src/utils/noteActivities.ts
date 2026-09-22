import type { Editor } from '@tiptap/core';
import {
  hasCheckableAnswers,
  normalizeMultipleChoiceDefinition,
  normalizeStudentAccess,
  resetAttempt,
  revealAttempt,
  useActivityEditStore,
  type ActivityDocumentValue,
  type ActivityMenuActionId,
  type ActivityShape,
  type ActivityStudentAccessKey,
} from 'modules.board/activities';
import { readActivityNode, serializeActivityNode } from '../extensions/activity/activityAttrs';

export type NoteActivity = {
  pos: number;
  value: ActivityDocumentValue;
};

export function listNoteActivities(editor: Editor): NoteActivity[] {
  const items: NoteActivity[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name !== 'activity') return;
    items.push({ pos, value: readActivityNode(node) });
  });
  return items;
}

function asShape(value: ActivityDocumentValue): ActivityShape {
  return { id: value.id, type: 'activity', props: value } as unknown as ActivityShape;
}

export function noteActivityShapes(activities: NoteActivity[]): ActivityShape[] {
  return activities.map((activity) => asShape(activity.value));
}

function patchActivities(
  editor: Editor,
  patch: (value: ActivityDocumentValue) => Partial<ActivityDocumentValue> | null,
) {
  if (!editor.isEditable) return;
  const { state } = editor;
  let tr = state.tr;
  let changed = false;

  state.doc.descendants((node, pos) => {
    if (node.type.name !== 'activity') return;
    const value = readActivityNode(node);
    const nextPatch = patch(value);
    if (!nextPatch) return;
    const next = { ...value, ...nextPatch };
    tr = tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      ...serializeActivityNode(next),
    });
    changed = true;
  });

  if (changed) editor.view.dispatch(tr);
}

export function runNoteActivityAction(editor: Editor, action: ActivityMenuActionId) {
  const activities = listNoteActivities(editor);
  if (activities.length === 0) return;

  if (action === 'edit') {
    const store = useActivityEditStore.getState();
    const nextEditing = !activities.every((activity) => store.isEditing(activity.value.id));
    for (const activity of activities) store.setEditing(activity.value.id, nextEditing);
    if (!nextEditing) {
      patchActivities(editor, (value) => {
        if (value.definition.kind !== 'multiple-choice') return null;
        const normalized = normalizeMultipleChoiceDefinition(value.definition);
        if (normalized === value.definition) return null;
        return { definition: normalized, kind: normalized.kind };
      });
    }
    return;
  }

  if (action === 'check') {
    patchActivities(editor, (value) =>
      hasCheckableAnswers(value.definition) ? { checkStatus: 'checked' } : null,
    );
    return;
  }

  if (action === 'reset') {
    patchActivities(editor, (value) => ({
      attempt: resetAttempt(value.definition),
      checkStatus: 'idle',
    }));
    return;
  }

  if (action === 'reveal') {
    patchActivities(editor, (value) => {
      if (value.kind === 'random-card') return null;
      return {
        attempt: revealAttempt(value.definition, value.attempt),
        checkStatus: 'revealed',
      };
    });
  }
}

export function setNoteStudentAccess(
  editor: Editor,
  key: ActivityStudentAccessKey,
  enabled: boolean,
) {
  patchActivities(editor, (value) => ({
    studentAccess: {
      ...normalizeStudentAccess(value.studentAccess),
      [key]: enabled,
    },
  }));
}
