import { useMemo, useState } from 'react';
import { Button } from '@xipkg/button';
import { Modal, ModalBody, ModalContent, ModalDescription, ModalTitle } from '@xipkg/modal';
import {
  ModalCloseIcon,
  modalBodyClass,
  modalConfirmButtonClass,
  modalContentClass,
  modalDescriptionClass,
  modalHeaderRowClass,
  modalTitleClass,
} from 'common.ui';
import {
  FEEDBACK_COMMENT_MAX_LENGTH,
  PRODUCT_ANALYTICS_EVENTS,
  prepareFeedbackComment,
  trackOnce,
  trackProductEvent,
  type ProductAnalyticsEventMap,
  type ProductAnalyticsFeedbackScore,
  type ProductAnalyticsFeedbackType,
} from 'common.utils';
import { AuthSupportLink } from '../AuthSupportLink';
import { RatingRow } from './RatingRow';

type CallRatings = {
  connection_quality: ProductAnalyticsFeedbackScore | null;
  stability: ProductAnalyticsFeedbackScore | null;
  media_quality: ProductAnalyticsFeedbackScore | null;
};

type BoardRatings = {
  usability: ProductAnalyticsFeedbackScore | null;
  stability: ProductAnalyticsFeedbackScore | null;
  responsiveness: ProductAnalyticsFeedbackScore | null;
};

type PostLessonFeedbackModalProps = {
  open: boolean;
  feedbackType: ProductAnalyticsFeedbackType;
  dedupeKey: string;
  labels: {
    title: string;
    callConnection: string;
    callStability: string;
    callMedia: string;
    boardUsability: string;
    boardStability: string;
    boardResponsiveness: string;
    commentLabel: string;
    commentPrivacy: string;
    commentPlaceholder: string;
    submit: string;
    supportPrompt: string;
    supportCta: string;
    thanksTitle: string;
    thanksGood: string;
    thanksLow: string;
    close: string;
  };
  onOpenChange: (open: boolean) => void;
};

const emptyCallRatings = (): CallRatings => ({
  connection_quality: null,
  stability: null,
  media_quality: null,
});

const emptyBoardRatings = (): BoardRatings => ({
  usability: null,
  stability: null,
  responsiveness: null,
});

const hasLowScore = (scores: Array<ProductAnalyticsFeedbackScore | null>) =>
  scores.some((score) => score === 1 || score === 2);

export const PostLessonFeedbackModal = ({
  open,
  feedbackType,
  dedupeKey,
  labels,
  onOpenChange,
}: PostLessonFeedbackModalProps) => {
  const [step, setStep] = useState<'form' | 'thanks'>('form');
  const [thanksLow, setThanksLow] = useState(false);
  const [comment, setComment] = useState('');
  const [callRatings, setCallRatings] = useState<CallRatings>(emptyCallRatings);
  const [boardRatings, setBoardRatings] = useState<BoardRatings>(emptyBoardRatings);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = useMemo(() => {
    if (submitted) return false;
    if (feedbackType === 'call') {
      return (
        callRatings.connection_quality != null &&
        callRatings.stability != null &&
        callRatings.media_quality != null
      );
    }
    return (
      boardRatings.usability != null &&
      boardRatings.stability != null &&
      boardRatings.responsiveness != null
    );
  }, [boardRatings, callRatings, feedbackType, submitted]);

  const resetForm = () => {
    setStep('form');
    setThanksLow(false);
    setComment('');
    setCallRatings(emptyCallRatings());
    setBoardRatings(emptyBoardRatings());
    setSubmitted(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  };

  const handleSupport = () => {
    trackOnce(`${dedupeKey}:support`, () => {
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.FEEDBACK_SUPPORT_CLICKED, {
        feedback_type: feedbackType,
        source: 'feedback_modal',
      });
    });
    handleOpenChange(false);
  };

  const handleSubmit = () => {
    if (!canSubmit || submitted) return;

    const trimmedComment = prepareFeedbackComment(comment);
    const low =
      feedbackType === 'call'
        ? hasLowScore([
            callRatings.connection_quality,
            callRatings.stability,
            callRatings.media_quality,
          ])
        : hasLowScore([
            boardRatings.usability,
            boardRatings.stability,
            boardRatings.responsiveness,
          ]);

    setSubmitted(true);

    trackOnce(`${dedupeKey}:submitted`, () => {
      if (feedbackType === 'call') {
        const payload: ProductAnalyticsEventMap['feedback_submitted'] = {
          feedback_type: 'call',
          connection_quality: callRatings.connection_quality as ProductAnalyticsFeedbackScore,
          stability: callRatings.stability as ProductAnalyticsFeedbackScore,
          media_quality: callRatings.media_quality as ProductAnalyticsFeedbackScore,
          source: 'post_lesson',
          ...(trimmedComment ? { comment: trimmedComment } : {}),
        };
        trackProductEvent(PRODUCT_ANALYTICS_EVENTS.FEEDBACK_SUBMITTED, payload);
        return;
      }

      const payload: ProductAnalyticsEventMap['feedback_submitted'] = {
        feedback_type: 'board',
        usability: boardRatings.usability as ProductAnalyticsFeedbackScore,
        stability: boardRatings.stability as ProductAnalyticsFeedbackScore,
        responsiveness: boardRatings.responsiveness as ProductAnalyticsFeedbackScore,
        source: 'post_lesson',
        ...(trimmedComment ? { comment: trimmedComment } : {}),
      };
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.FEEDBACK_SUBMITTED, payload);
    });

    setThanksLow(low);
    setStep('thanks');
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent className={modalContentClass}>
        <ModalBody className={modalBodyClass}>
          <div className={modalHeaderRowClass}>
            <ModalTitle className={modalTitleClass}>
              {step === 'thanks' ? labels.thanksTitle : labels.title}
            </ModalTitle>
            <ModalCloseIcon onClick={() => handleOpenChange(false)} aria-label={labels.close} />
          </div>

          {step === 'form' ? (
            <>
              <div className="flex flex-col gap-4">
                {feedbackType === 'call' ? (
                  <>
                    <RatingRow
                      label={labels.callConnection}
                      value={callRatings.connection_quality}
                      onChange={(value) =>
                        setCallRatings((current) => ({ ...current, connection_quality: value }))
                      }
                    />
                    <RatingRow
                      label={labels.callStability}
                      value={callRatings.stability}
                      onChange={(value) =>
                        setCallRatings((current) => ({ ...current, stability: value }))
                      }
                    />
                    <RatingRow
                      label={labels.callMedia}
                      value={callRatings.media_quality}
                      onChange={(value) =>
                        setCallRatings((current) => ({ ...current, media_quality: value }))
                      }
                    />
                  </>
                ) : (
                  <>
                    <RatingRow
                      label={labels.boardUsability}
                      value={boardRatings.usability}
                      onChange={(value) =>
                        setBoardRatings((current) => ({ ...current, usability: value }))
                      }
                    />
                    <RatingRow
                      label={labels.boardStability}
                      value={boardRatings.stability}
                      onChange={(value) =>
                        setBoardRatings((current) => ({ ...current, stability: value }))
                      }
                    />
                    <RatingRow
                      label={labels.boardResponsiveness}
                      value={boardRatings.responsiveness}
                      onChange={(value) =>
                        setBoardRatings((current) => ({ ...current, responsiveness: value }))
                      }
                    />
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs-base text-text-secondary">{labels.commentPrivacy}</p>
                <label
                  className="text-s-base text-text-primary font-medium"
                  htmlFor="post-lesson-feedback-comment"
                >
                  {labels.commentLabel}
                </label>
                <textarea
                  id="post-lesson-feedback-comment"
                  value={comment}
                  maxLength={FEEDBACK_COMMENT_MAX_LENGTH}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder={labels.commentPlaceholder}
                  className="border-border-default placeholder:text-text-disabled text-text-primary min-h-22 w-full resize-y rounded-lg border bg-transparent px-3 py-2 text-sm outline-none"
                />
              </div>

              <Button
                type="button"
                size="m"
                className={modalConfirmButtonClass}
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                {labels.submit}
              </Button>

              <div className="border-border-default flex flex-col gap-2 border-t pt-4">
                <p className={`${modalDescriptionClass} text-s-base`}>{labels.supportPrompt}</p>
                <div className="flex justify-center">
                  <AuthSupportLink
                    label={labels.supportCta}
                    className="w-fit"
                    onBeforeOpen={handleSupport}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <ModalDescription className={modalDescriptionClass}>
                {thanksLow ? labels.thanksLow : labels.thanksGood}
              </ModalDescription>
              {thanksLow ? (
                <div className="flex justify-center">
                  <AuthSupportLink
                    label={labels.supportCta}
                    className="w-fit"
                    onBeforeOpen={handleSupport}
                  />
                </div>
              ) : null}
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
