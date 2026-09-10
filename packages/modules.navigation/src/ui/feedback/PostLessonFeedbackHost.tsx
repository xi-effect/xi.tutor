import { useEffect, useRef, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useCurrentUser } from 'common.services';
import { useCallStore } from 'modules.calls';
import {
  PRODUCT_ANALYTICS_EVENTS,
  clearPendingPostLessonFeedback,
  clearPostLessonFeedbackCooldown,
  debugQueuePostLessonFeedback,
  endClassroomFeedbackWindow,
  getPostLessonFeedbackSession,
  readPostLessonFeedbackPersisted,
  resetPostLessonFeedbackState,
  subscribePostLessonFeedback,
  trackOnce,
  trackProductEvent,
  tryQueuePostLessonFeedback,
  type ProductAnalyticsFeedbackType,
} from 'common.utils';
import { isBoardPath } from '../constants';
import { PostLessonFeedbackModal } from './PostLessonFeedbackModal';
import { PostLessonFeedbackToast } from './PostLessonFeedbackToast';

const TOAST_ID = 'post-lesson-feedback';
const TOAST_DURATION_MS = 20_000;

export const PostLessonFeedbackHost = () => {
  const { t } = useTranslation('navigation');
  const { pathname } = useLocation();
  const { data: user } = useCurrentUser();
  const token = useCallStore((state) => state.token);
  const [session, setSession] = useState(getPostLessonFeedbackSession);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ProductAnalyticsFeedbackType | null>(null);

  const isTutor = user?.default_layout === 'tutor';
  const inCall = Boolean(token);
  const pendingType = session.pendingType;
  const outcomeRef = useRef<'opened' | 'dismissed' | null>(null);
  const skipDismissEventRef = useRef(false);
  const shownKeyRef = useRef<string | null>(null);
  const wasInCallRef = useRef(inCall);
  const wasInClassroomRef = useRef(pathname.includes('/classrooms/'));
  const wasOnBoardRef = useRef(isBoardPath(pathname));
  const prevUserIdRef = useRef<number | null>(null);

  useEffect(
    () => subscribePostLessonFeedback(() => setSession(getPostLessonFeedbackSession())),
    [],
  );

  useEffect(() => {
    const nextId = user?.id ?? null;
    if (prevUserIdRef.current != null && prevUserIdRef.current !== nextId) {
      resetPostLessonFeedbackState();
      toast.dismiss(TOAST_ID);
      setModalOpen(false);
      setModalType(null);
      shownKeyRef.current = null;
    }
    prevUserIdRef.current = nextId;
  }, [user?.id]);

  useEffect(() => {
    if (!isTutor || user == null) {
      wasInCallRef.current = inCall;
      wasInClassroomRef.current = pathname.includes('/classrooms/');
      wasOnBoardRef.current = isBoardPath(pathname);
      return;
    }

    const inClassroom = pathname.includes('/classrooms/');
    const onBoard = isBoardPath(pathname);

    const userId = user.id;
    const queueFeedback = (endWindow = false) => {
      window.setTimeout(() => {
        tryQueuePostLessonFeedback(userId);
        if (endWindow) {
          endClassroomFeedbackWindow();
        }
      }, 0);
    };

    if (wasInCallRef.current && !inCall) {
      queueFeedback();
    }

    if (!inCall && wasOnBoardRef.current && !onBoard) {
      queueFeedback();
    }

    if (!inCall && wasInClassroomRef.current && !inClassroom) {
      queueFeedback(true);
    }

    wasInCallRef.current = inCall;
    wasInClassroomRef.current = inClassroom;
    wasOnBoardRef.current = onBoard;
  }, [inCall, isTutor, pathname, user]);

  useEffect(() => {
    if (!isTutor || user == null || !pendingType || inCall || modalOpen) {
      if (inCall && shownKeyRef.current) {
        skipDismissEventRef.current = true;
        toast.dismiss(TOAST_ID);
        shownKeyRef.current = null;
        clearPendingPostLessonFeedback();
      }
      return;
    }

    const shownKey = `${pendingType}:${session.previewNonce}`;
    if (shownKeyRef.current === shownKey) return;

    shownKeyRef.current = shownKey;
    outcomeRef.current = null;
    skipDismissEventRef.current = false;
    const promptAt = readPostLessonFeedbackPersisted(user.id).lastPromptAt;
    const promptKey = `${user.id}:${pendingType}:${promptAt}:${session.previewNonce}`;

    trackOnce(`feedback_prompt_shown:${promptKey}`, () => {
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.FEEDBACK_PROMPT_SHOWN, {
        feedback_type: pendingType,
        source: 'post_lesson',
      });
    });

    toast.custom(
      (toastId) => (
        <PostLessonFeedbackToast
          toastId={toastId}
          title={t('feedback.toastTitle')}
          description={t('feedback.toastDescription')}
          actionLabel={t('feedback.rate')}
          closeLabel={t('close')}
          onRate={() => {
            outcomeRef.current = 'opened';
            shownKeyRef.current = null;
            setModalType(pendingType);
            setModalOpen(true);
            clearPendingPostLessonFeedback();
            trackOnce(`feedback_prompt_opened:${promptKey}`, () => {
              trackProductEvent(PRODUCT_ANALYTICS_EVENTS.FEEDBACK_PROMPT_OPENED, {
                feedback_type: pendingType,
                source: 'post_lesson',
              });
            });
          }}
          onDismiss={() => {
            outcomeRef.current = 'dismissed';
            shownKeyRef.current = null;
            clearPendingPostLessonFeedback();
            trackOnce(`feedback_prompt_dismissed:${promptKey}`, () => {
              trackProductEvent(PRODUCT_ANALYTICS_EVENTS.FEEDBACK_PROMPT_DISMISSED, {
                feedback_type: pendingType,
                source: 'post_lesson',
              });
            });
          }}
        />
      ),
      {
        id: TOAST_ID,
        duration: TOAST_DURATION_MS,
        onAutoClose: () => {
          skipDismissEventRef.current = true;
          if (outcomeRef.current) return;
          shownKeyRef.current = null;
          clearPendingPostLessonFeedback();
        },
        onDismiss: () => {
          if (outcomeRef.current || skipDismissEventRef.current) return;
          outcomeRef.current = 'dismissed';
          shownKeyRef.current = null;
          clearPendingPostLessonFeedback();
          trackOnce(`feedback_prompt_dismissed:${promptKey}`, () => {
            trackProductEvent(PRODUCT_ANALYTICS_EVENTS.FEEDBACK_PROMPT_DISMISSED, {
              feedback_type: pendingType,
              source: 'post_lesson',
            });
          });
        },
      },
    );
  }, [inCall, isTutor, modalOpen, pendingType, session.previewNonce, t, user]);

  useEffect(() => {
    window.__sovliumFeedback = {
      show: (type = 'call') => debugQueuePostLessonFeedback(type),
      resetCooldown: () => {
        if (user?.id != null) {
          clearPostLessonFeedbackCooldown(user.id);
          return;
        }
        clearPostLessonFeedbackCooldown();
      },
    };

    return () => {
      delete window.__sovliumFeedback;
    };
  }, [user?.id]);

  if (!isTutor || !modalType || user == null) return null;

  const dedupeKey = `${user.id}:${modalType}:${readPostLessonFeedbackPersisted(user.id).lastPromptAt}:${session.previewNonce}`;

  return (
    <PostLessonFeedbackModal
      open={modalOpen}
      feedbackType={modalType}
      dedupeKey={dedupeKey}
      labels={{
        title: t('feedback.modalTitle'),
        callConnection: t('feedback.callConnection'),
        callStability: t('feedback.callStability'),
        callMedia: t('feedback.callMedia'),
        boardUsability: t('feedback.boardUsability'),
        boardStability: t('feedback.boardStability'),
        boardResponsiveness: t('feedback.boardResponsiveness'),
        commentLabel: t('feedback.commentLabel'),
        commentPrivacy: t('feedback.commentPrivacy'),
        commentPlaceholder: t('feedback.commentPlaceholder'),
        submit: t('feedback.submit'),
        supportPrompt: t('feedback.supportPrompt'),
        supportCta: t('feedback.supportCta'),
        thanksTitle: t('feedback.thanksTitle'),
        thanksGood: t('feedback.thanksGood'),
        thanksLow: t('feedback.thanksLow'),
        close: t('close'),
      }}
      onOpenChange={setModalOpen}
    />
  );
};
