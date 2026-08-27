import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { AudioNodeAttrs, AudioTimecode } from '../audioTypes';

type UpdateAudioAttrs = (attrs: Record<string, unknown>) => void;

export function useAudioTimecodes(
  attrs: AudioNodeAttrs,
  updateAttributes: UpdateAudioAttrs,
  isTutor: boolean,
) {
  const addTimecode = useCallback(
    (currentTime: number) => {
      const tc: AudioTimecode = {
        id: nanoid(8),
        time: currentTime,
        label: '',
        visibleToAll: isTutor ? (attrs.timecodesVisibleByDefault ?? true) : true,
        createdByStudent: !isTutor,
      };
      const next = [...attrs.timecodes, tc].sort((a, b) => a.time - b.time);
      updateAttributes({ timecodes: next });
    },
    [attrs.timecodes, attrs.timecodesVisibleByDefault, isTutor, updateAttributes],
  );

  const removeTimecode = useCallback(
    (tcId: string) => {
      updateAttributes({ timecodes: attrs.timecodes.filter((t) => t.id !== tcId) });
    },
    [attrs.timecodes, updateAttributes],
  );

  const updateTimecodeLabel = useCallback(
    (tcId: string, label: string) => {
      updateAttributes({
        timecodes: attrs.timecodes.map((t) => (t.id === tcId ? { ...t, label } : t)),
      });
    },
    [attrs.timecodes, updateAttributes],
  );

  const toggleTimecodeVisibility = useCallback(
    (tcId: string) => {
      updateAttributes({
        timecodes: attrs.timecodes.map((t) =>
          t.id === tcId ? { ...t, visibleToAll: !t.visibleToAll } : t,
        ),
      });
    },
    [attrs.timecodes, updateAttributes],
  );

  return {
    addTimecode,
    removeTimecode,
    updateTimecodeLabel,
    toggleTimecodeVisibility,
  };
}
