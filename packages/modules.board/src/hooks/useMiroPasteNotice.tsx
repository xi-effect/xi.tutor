import { useEffect } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { Editor } from '@ibodr/draw';
import { PRODUCT_ANALYTICS_EVENTS, getProductAnalyticsRole, trackProductEvent } from 'common.utils';
import { useCurrentUser } from 'common.services';
import { useParams, useSearch } from '@tanstack/react-router';
import { MiroPasteToast } from '../ui/components/shared/MiroPasteToast';

/** Mirrors `@ibodr/draw` MiroPasteInfo — kept local until package bump. */
type MiroPasteInfo = {
  shapeCount: number;
  shapeIds: string[];
  widgetTypes: string[];
  miroBoardId: string | null;
  miroHost: string | null;
};

type PasteMiroEmitter = {
  on(event: 'paste-miro', cb: (info: MiroPasteInfo) => void): void;
  off(event: 'paste-miro', cb: (info: MiroPasteInfo) => void): void;
};

type UseMiroPasteNoticeArgs = {
  editor: Editor | null;
  enabled?: boolean;
};

/** localStorage: `'true'` → больше не показывать info-плашку после вставки из Miro */
export const MIRO_PASTE_NOTICE_DISMISSED_KEY = 'sovlium.board.miroPasteNoticeDismissed';

const MIRO_PASTE_TOAST_DURATION_MS = 20_000;

const isMiroPasteNoticeDismissed = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(MIRO_PASTE_NOTICE_DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
};

const dismissMiroPasteNoticeForever = () => {
  try {
    window.localStorage.setItem(MIRO_PASTE_NOTICE_DISMISSED_KEY, 'true');
  } catch {
    // private mode / quota
  }
};

/**
 * Shows an info toast and tracks analytics when the user pastes Miro content.
 * Relies on the `paste-miro` editor event emitted by `@ibodr/draw`.
 */
export const useMiroPasteNotice = ({ editor, enabled = true }: UseMiroPasteNoticeArgs) => {
  const { t } = useTranslation('board');
  const { data: user } = useCurrentUser();
  const { classroomId, boardId, materialId } = useParams({ strict: false });
  const search = useSearch({ strict: false }) as { call?: string };

  useEffect(() => {
    if (!enabled || !editor) return;

    const onPasteMiro = (info: MiroPasteInfo) => {
      if (!isMiroPasteNoticeDismissed()) {
        toast.custom(
          (toastId) => (
            <MiroPasteToast
              toastId={toastId}
              title={t('toast.miroPasteTitle')}
              betaLabel={t('toast.miroPasteBeta')}
              description={t('toast.miroPasteDesc', { count: info.shapeCount })}
              imagesNote={t('toast.miroPasteImagesNote')}
              dismissLabel={t('toast.miroPasteDontShowAgain')}
              onDismissForever={dismissMiroPasteNoticeForever}
            />
          ),
          { duration: MIRO_PASTE_TOAST_DURATION_MS },
        );
      }

      const role = getProductAnalyticsRole(user?.default_layout);
      const source = search.call
        ? 'call'
        : classroomId
          ? 'classroom'
          : materialId || boardId
            ? 'materials'
            : 'unknown';

      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.BOARD_MIRO_PASTE, {
        role,
        source,
        shape_count: info.shapeCount,
        widget_types: info.widgetTypes.join(','),
        miro_host: info.miroHost ?? undefined,
      });
    };

    const emitter = editor as Editor & PasteMiroEmitter;
    emitter.on('paste-miro', onPasteMiro);
    return () => {
      emitter.off('paste-miro', onPasteMiro);
    };
  }, [editor, enabled, t, user?.default_layout, classroomId, boardId, materialId, search.call]);
};
