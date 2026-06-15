import { useEffect, useMemo, useRef } from 'react';
import { useParams, useSearch } from '@tanstack/react-router';
import type { Editor } from '@ibodr/draw';
import type { Awareness } from 'y-protocols/awareness';
import { useCurrentUser } from 'common.services';
import {
  PRODUCT_ANALYTICS_EVENTS,
  getProductAnalyticsRole,
  trackProductEvent,
  type ProductAnalyticsBoardTrigger,
  type ProductAnalyticsSource,
} from 'common.utils';

type UseProductBoardAnalyticsArgs = {
  editor: Editor | null;
  awareness: Awareness | null;
  enabled?: boolean;
};

const MEANINGFUL_OBJECT_CHANGES = 3;
const MEANINGFUL_DURATION_MS = 3 * 60 * 1000;
const MEANINGFUL_CALL_DURATION_MS = 2 * 60 * 1000;
const MEANINGFUL_COLLAB_DURATION_MS = 2 * 60 * 1000;

const resolveBoardSource = ({
  classroomId,
  materialId,
  boardId,
  hasCallSearchParam,
}: {
  classroomId?: string;
  materialId?: string;
  boardId?: string;
  hasCallSearchParam: boolean;
}): ProductAnalyticsSource => {
  if (hasCallSearchParam) return 'call';
  if (classroomId) return 'classroom';
  if (materialId || boardId) return 'materials';
  return 'unknown';
};

export const useProductBoardAnalytics = ({
  editor,
  awareness,
  enabled = true,
}: UseProductBoardAnalyticsArgs) => {
  const { classroomId, boardId, materialId } = useParams({ strict: false });
  const search = useSearch({ strict: false }) as { call?: string };
  const { data: user } = useCurrentUser();

  const role = getProductAnalyticsRole(user?.default_layout);
  const source = useMemo(
    () =>
      resolveBoardSource({
        classroomId,
        materialId,
        boardId,
        hasCallSearchParam: Boolean(search.call),
      }),
    [boardId, classroomId, materialId, search.call],
  );

  const openedTrackedRef = useRef(false);
  const meaningfulTrackedRef = useRef(false);
  const objectChangesRef = useRef(0);
  const openedAtRef = useRef<number | null>(null);
  const collaboratorCountRef = useRef(1);

  const trackMeaningfulUsage = (trigger: ProductAnalyticsBoardTrigger) => {
    if (meaningfulTrackedRef.current) return;

    meaningfulTrackedRef.current = true;
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.BOARD_USED_MEANINGFULLY, {
      role,
      source,
      trigger,
    });
  };

  const evaluateMeaningfulUsage = () => {
    if (meaningfulTrackedRef.current || openedAtRef.current == null) return;

    const elapsedMs = Date.now() - openedAtRef.current;

    if (objectChangesRef.current >= MEANINGFUL_OBJECT_CHANGES) {
      trackMeaningfulUsage('objects');
      return;
    }

    if (elapsedMs >= MEANINGFUL_DURATION_MS) {
      trackMeaningfulUsage('duration');
      return;
    }

    if (source === 'call' && elapsedMs >= MEANINGFUL_CALL_DURATION_MS) {
      trackMeaningfulUsage('duration');
      return;
    }

    if (collaboratorCountRef.current >= 2 && elapsedMs >= MEANINGFUL_COLLAB_DURATION_MS) {
      trackMeaningfulUsage('collaboration');
    }
  };

  useEffect(() => {
    if (!enabled || openedTrackedRef.current) return;

    openedTrackedRef.current = true;
    openedAtRef.current = Date.now();

    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.BOARD_OPENED, {
      role,
      source,
    });
  }, [enabled, role, source]);

  useEffect(() => {
    if (!enabled || !editor) return;

    const unsubscribe = editor.store.listen(({ changes }) => {
      const added = Object.values(changes.added ?? {});
      const updated = Object.values(changes.updated ?? {});
      const removed = Object.values(changes.removed ?? {});

      const isPresenceRecord = (record: { typeName?: string }) =>
        record.typeName === 'instance_presence' || record.typeName === 'pointer';

      const meaningfulChanges = [...added, ...updated, ...removed].filter(
        (record) => !isPresenceRecord(record as { typeName?: string }),
      ).length;

      if (meaningfulChanges === 0) return;

      objectChangesRef.current += meaningfulChanges;
      evaluateMeaningfulUsage();
    });

    return unsubscribe;
  }, [editor, enabled]);

  useEffect(() => {
    if (!enabled || !awareness) return;

    const updateCollaborators = () => {
      collaboratorCountRef.current = Math.max(1, awareness.getStates().size);
      evaluateMeaningfulUsage();
    };

    updateCollaborators();
    awareness.on('change', updateCollaborators);

    return () => {
      awareness.off('change', updateCollaborators);
    };
  }, [awareness, enabled]);

  useEffect(() => {
    if (!enabled || openedAtRef.current == null) return;

    const intervalId = window.setInterval(evaluateMeaningfulUsage, 30_000);
    return () => window.clearInterval(intervalId);
  }, [enabled, source]);
};
