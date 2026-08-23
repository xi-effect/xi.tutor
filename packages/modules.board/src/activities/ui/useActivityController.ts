import { useCallback } from 'react';
import { useEditor } from '@ibodr/draw';
import type { ActivityShape } from '../shape/ActivityShape';
import type { ActivityAttempt, ActivityDefinition, CheckStatus } from '../model/types';
import { evaluateActivity } from '../primitives/evaluate';
import { checkActivity, resetActivity, revealActivity } from '../shape/activityCommands';

export function useActivityController(shape: ActivityShape) {
  const editor = useEditor();

  const patch = useCallback(
    (props: Partial<ActivityShape['props']>) => {
      editor.updateShape({
        id: shape.id,
        type: 'activity',
        props,
      });
    },
    [editor, shape.id],
  );

  const setDefinition = useCallback(
    (definition: ActivityDefinition) => {
      patch({ definition, kind: definition.kind, checkStatus: 'idle' });
    },
    [patch],
  );

  const setAttempt = useCallback(
    (attempt: ActivityAttempt, checkStatus: CheckStatus = 'idle') => {
      patch({ attempt, checkStatus });
    },
    [patch],
  );

  const check = useCallback(() => checkActivity(editor, shape), [editor, shape]);
  const reset = useCallback(() => resetActivity(editor, shape), [editor, shape]);
  const reveal = useCallback(() => revealActivity(editor, shape), [editor, shape]);

  const score = evaluateActivity(shape.props.definition, shape.props.attempt);

  return { patch, setDefinition, setAttempt, check, reset, reveal, score };
}
