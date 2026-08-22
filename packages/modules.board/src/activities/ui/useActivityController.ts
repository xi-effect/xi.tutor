import { useCallback } from 'react';
import { useEditor } from '@ibodr/draw';
import type { ActivityShape } from '../shape/ActivityShape';
import type { ActivityAttempt, ActivityDefinition, CheckStatus } from '../model/types';
import { evaluateActivity } from '../primitives/evaluate';
import { resetAttempt, revealAttempt } from '../primitives/reset';

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

  const check = useCallback(() => {
    editor.markHistoryStoppingPoint('activity-check');
    patch({ checkStatus: 'checked' });
  }, [editor, patch]);

  const reset = useCallback(() => {
    editor.markHistoryStoppingPoint('activity-reset');
    patch({ attempt: resetAttempt(shape.props.definition), checkStatus: 'idle' });
  }, [editor, patch, shape.props.definition]);

  const reveal = useCallback(() => {
    editor.markHistoryStoppingPoint('activity-reveal');
    patch({
      attempt: revealAttempt(shape.props.definition, shape.props.attempt),
      checkStatus: 'revealed',
    });
  }, [editor, patch, shape.props.attempt, shape.props.definition]);

  const score = evaluateActivity(shape.props.definition, shape.props.attempt);

  return { patch, setDefinition, setAttempt, check, reset, reveal, score };
}
