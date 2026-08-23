import type { Editor } from '@ibodr/draw';
import { hasCheckableAnswers } from '../primitives/evaluate';
import { resetAttempt, revealAttempt } from '../primitives/reset';
import type { ActivityStudentAccessKey } from '../model/studentAccess';
import { normalizeStudentAccess } from '../model/studentAccess';
import type { ActivityShape } from './ActivityShape';
import { useActivityEditStore } from '../store/activityEditStore';
import type { ActivityDefinition } from '../model/types';

function asActivity(editor: Editor, shape: ActivityShape): ActivityShape | null {
  const next = editor.getShape(shape.id);
  if (!next || next.type !== 'activity') return null;
  return next as ActivityShape;
}

export function applyActivityAction(
  editor: Editor,
  shapes: ActivityShape[],
  action: 'edit' | 'check' | 'reset' | 'reveal',
) {
  const current = shapes
    .map((shape) => asActivity(editor, shape))
    .filter(Boolean) as ActivityShape[];
  if (current.length === 0) return;

  if (action === 'edit') {
    const store = useActivityEditStore.getState();
    const nextEditing = !current.every((shape) => store.isEditing(shape.id));
    for (const shape of current) store.setEditing(shape.id, nextEditing);
    return;
  }

  editor.markHistoryStoppingPoint(`activity-${action}`);

  if (action === 'check') {
    editor.updateShapes(
      current
        .filter((shape) => hasCheckableAnswers(shape.props.definition))
        .map((shape) => ({
          id: shape.id,
          type: 'activity' as const,
          props: { checkStatus: 'checked' as const },
        })),
    );
    return;
  }

  if (action === 'reset') {
    editor.updateShapes(
      current.map((shape) => ({
        id: shape.id,
        type: 'activity' as const,
        props: {
          attempt: resetAttempt(shape.props.definition),
          checkStatus: 'idle' as const,
        },
      })),
    );
    return;
  }

  editor.updateShapes(
    current
      .filter((shape) => shape.props.kind !== 'random-card')
      .map((shape) => ({
        id: shape.id,
        type: 'activity' as const,
        props: {
          attempt: revealAttempt(shape.props.definition, shape.props.attempt),
          checkStatus: 'revealed' as const,
        },
      })),
  );
}

export function setActivityStudentAccess(
  editor: Editor,
  shapes: ActivityShape[],
  key: ActivityStudentAccessKey,
  value: boolean,
) {
  const current = shapes
    .map((shape) => asActivity(editor, shape))
    .filter(Boolean) as ActivityShape[];
  if (current.length === 0) return;
  editor.markHistoryStoppingPoint('activity-student-access');
  editor.updateShapes(
    current.map((shape) => ({
      id: shape.id,
      type: 'activity' as const,
      props: {
        studentAccess: { ...normalizeStudentAccess(shape.props.studentAccess), [key]: value },
      },
    })),
  );
}

export function patchActivityDefinitions(
  editor: Editor,
  shapes: ActivityShape[],
  patch: (definition: ActivityDefinition) => ActivityDefinition | null,
) {
  const current = shapes
    .map((shape) => asActivity(editor, shape))
    .filter(Boolean) as ActivityShape[];
  const updates = current.flatMap((shape) => {
    const definition = patch(shape.props.definition);
    if (!definition) return [];
    return [
      {
        id: shape.id,
        type: 'activity' as const,
        props: { definition, kind: definition.kind, checkStatus: 'idle' as const },
      },
    ];
  });
  if (updates.length === 0) return;
  editor.markHistoryStoppingPoint('activity-definition');
  editor.updateShapes(updates);
}

export function checkActivity(editor: Editor, shape: ActivityShape) {
  applyActivityAction(editor, [shape], 'check');
}

export function resetActivity(editor: Editor, shape: ActivityShape) {
  applyActivityAction(editor, [shape], 'reset');
}

export function revealActivity(editor: Editor, shape: ActivityShape) {
  applyActivityAction(editor, [shape], 'reveal');
}
