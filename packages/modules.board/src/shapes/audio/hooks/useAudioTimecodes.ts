import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import { useEditor } from 'tldraw';
import { computeAudioShapeHeight } from '../AudioShape';
import type { AudioShape, AudioTimecode } from '../AudioShape';

export function useAudioTimecodes(shape: AudioShape) {
  const editor = useEditor();

  const addTimecode = useCallback(
    (currentTime: number) => {
      const tc: AudioTimecode = {
        id: nanoid(8),
        time: currentTime,
        label: '',
        visibleToAll: false,
      };
      const next = [...shape.props.timecodes, tc].sort((a, b) => a.time - b.time);
      editor.updateShape<AudioShape>({
        id: shape.id,
        type: 'audio',
        props: { timecodes: next, h: computeAudioShapeHeight(next.length) },
      });
    },
    [editor, shape.id, shape.props.timecodes],
  );

  const removeTimecode = useCallback(
    (tcId: string) => {
      const next = shape.props.timecodes.filter((t) => t.id !== tcId);
      editor.updateShape<AudioShape>({
        id: shape.id,
        type: 'audio',
        props: { timecodes: next, h: computeAudioShapeHeight(next.length) },
      });
    },
    [editor, shape.id, shape.props.timecodes],
  );

  const updateTimecodeLabel = useCallback(
    (tcId: string, label: string) => {
      const next = shape.props.timecodes.map((t) => (t.id === tcId ? { ...t, label } : t));
      editor.updateShape<AudioShape>({
        id: shape.id,
        type: 'audio',
        props: { timecodes: next },
      });
    },
    [editor, shape.id, shape.props.timecodes],
  );

  const toggleTimecodeVisibility = useCallback(
    (tcId: string) => {
      const next = shape.props.timecodes.map((t) =>
        t.id === tcId ? { ...t, visibleToAll: !t.visibleToAll } : t,
      );
      editor.updateShape<AudioShape>({
        id: shape.id,
        type: 'audio',
        props: { timecodes: next },
      });
    },
    [editor, shape.id, shape.props.timecodes],
  );

  return {
    addTimecode,
    removeTimecode,
    updateTimecodeLabel,
    toggleTimecodeVisibility,
  };
}
