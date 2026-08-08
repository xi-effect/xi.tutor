import { Close } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import '../utils/driver.css';
import { createRoot } from 'react-dom/client';
import { useCurrentUser, useOnboardingTransition } from 'common.services';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PRODUCT_ANALYTICS_EVENTS,
  getOnboardingStepMeta,
  resolveOnboardingAnalyticsRole,
  trackOnce,
  trackOnboardingCompleted,
  trackOnboardingStepCompleted,
  trackOnboardingStepFailed,
  trackOnboardingStepSkipped,
  trackProductEvent,
} from 'common.utils';

type OnboardingPopupT = {
  disabled?: boolean;
  steps?: DriveStep[];
};

const SESSION_STORAGE_KEY = 'onboarding_menu_hidden';
const SHOW_FOR_COMPLETED_KEY = 'show_onboarding_for_completed';

function trackOnboardingTourCompleteLegacy(layout: string | undefined) {
  if (typeof window === 'undefined') {
    return;
  }
  const win = window as Window & {
    umami?: { track: (name: string, data?: Record<string, unknown>) => void };
  };
  if (!win.umami) {
    return;
  }
  win.umami.track('onboarding-complete', {
    layout: layout === 'tutor' ? 'tutor' : 'student',
  });
}

/** driver.js в onDestroyed передаёт не ссылку из steps[], а клон `{ ...step, popover: merged }` — indexOf не сработает. */
function isDestroyedOnLastTourStep(step: DriveStep | undefined, validSteps: DriveStep[]): boolean {
  if (!step || validSteps.length === 0) {
    return false;
  }
  const last = validSteps[validSteps.length - 1];
  return last.element === step.element;
}

export const OnboardingPopup = ({ disabled = false, steps = [] }: OnboardingPopupT) => {
  const { t } = useTranslation('commonUi');
  const { data: user, isLoading } = useCurrentUser();
  const [isHidden, setIsHidden] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showForCompleted, setShowForCompleted] = useState(false);
  const { transitionStage } = useOnboardingTransition('completed', 'forwards');

  useEffect(() => {
    if (user?.onboarding_stage !== 'training') return;

    const userRole = resolveOnboardingAnalyticsRole(user?.default_layout);
    const stepMeta = getOnboardingStepMeta('training');

    trackOnce('onboarding_step_viewed:training', () => {
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ONBOARDING_STEP_VIEWED, {
        ...stepMeta,
        user_role: userRole,
        onboarding_stage: user.onboarding_stage,
      });
    });
  }, [user?.onboarding_stage, user?.default_layout]);

  useEffect(() => {
    const checkSessionStorage = () => {
      const hiddenInSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
      const showForCompletedInSession = sessionStorage.getItem(SHOW_FOR_COMPLETED_KEY);

      setIsHidden(hiddenInSession === 'true');
      setShowForCompleted(showForCompletedInSession === 'true');
    };

    checkSessionStorage();

    const handleOnboardingShowRequested = () => {
      checkSessionStorage();
    };

    window.addEventListener('onboarding-show-requested', handleOnboardingShowRequested);

    return () => {
      window.removeEventListener('onboarding-show-requested', handleOnboardingShowRequested);
    };
  }, []);

  const hideMenuForSession = () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    sessionStorage.removeItem(SHOW_FOR_COMPLETED_KEY);
    setIsHidden(true);
    setShowForCompleted(false);
  };

  const finishOnboardingAnalytics = (
    completionPath: 'tour_done' | 'skipped' | 'auto_no_steps',
    skipReason?: 'later' | 'dismiss' | 'no_steps',
  ) => {
    const userRole = resolveOnboardingAnalyticsRole(user?.default_layout);

    if (completionPath === 'tour_done') {
      trackOnboardingStepCompleted('training', userRole, 'training');
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ACTIVATION_TUTORIAL_COMPLETED, {
        screen: 'onboarding',
        reason: 'unknown',
      });
    } else if (skipReason) {
      trackOnboardingStepSkipped('training', userRole, skipReason, 'training');
    }

    trackOnboardingCompleted(userRole, {
      onboardingStage: 'completed',
      completionPath,
    });
  };

  /** «Позже» — пропускает тур, но завершает онбординг на backend. */
  const completeOnboarding = () => {
    hideMenuForSession();

    if (user?.onboarding_stage === 'completed') {
      return;
    }

    setIsTransitioning(true);

    transitionStage.mutate(undefined, {
      onSuccess: () => {
        finishOnboardingAnalytics('skipped', 'later');
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setIsTransitioning(false);
      },
      onError: (error) => {
        console.error('Ошибка при завершении онбординга:', error);
        trackOnboardingStepFailed(
          'training',
          resolveOnboardingAnalyticsRole(user?.default_layout),
          error,
          'training',
        );
        setIsTransitioning(false);
      },
    });
  };

  const isTutor = user?.default_layout === 'tutor';
  const shouldShowForCompleted = user?.onboarding_stage === 'completed' && showForCompleted;
  const shouldShowForTraining = user?.onboarding_stage === 'training';

  const driverAction = useCallback(() => {
    hideMenuForSession();

    const userRole = resolveOnboardingAnalyticsRole(user?.default_layout);

    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ACTIVATION_TUTORIAL_STARTED, {
      screen: 'onboarding',
      reason: 'unknown',
    });

    const validSteps = steps.filter((step) => {
      if (!step.popover?.description || step.popover.description.trim() === '') {
        return false;
      }

      if (typeof step.element === 'string') {
        const element = document.querySelector(step.element);
        return element !== null;
      }
      return true;
    });

    const missingElements = steps
      .map((step) => step.element)
      .filter(
        (selector): selector is string =>
          typeof selector === 'string' && !document.querySelector(selector),
      );

    if (missingElements.length > 0) {
      console.warn('Некоторые элементы для обучения не найдены:', missingElements);
    }

    if (validSteps.length === 0) {
      console.warn('Нет валидных шагов для обучения, автоматически завершаем онбординг');

      if (user?.onboarding_stage === 'completed') {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        sessionStorage.removeItem(SHOW_FOR_COMPLETED_KEY);
        setShowForCompleted(false);
        return;
      }

      setIsTransitioning(true);

      transitionStage.mutate(undefined, {
        onSuccess: () => {
          finishOnboardingAnalytics('auto_no_steps', 'no_steps');
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          sessionStorage.removeItem(SHOW_FOR_COMPLETED_KEY);
          setShowForCompleted(false);
          setIsTransitioning(false);
        },
        onError: (error) => {
          console.error('Ошибка при завершении онбординга:', error);
          trackOnboardingStepFailed('training', userRole, error, 'training');
          setIsTransitioning(false);
        },
      });
      return;
    }

    const driverObj = driver({
      popoverClass: 'my-custom-popover-class',
      showProgress: true,
      popoverOffset: 20,
      steps: validSteps,

      onPopoverRender: (popover) => {
        const defaultCloseButton = popover.closeButton;
        const customCloseButton = document.createElement('button');
        customCloseButton.className = 'driver-popover-close-btn';

        const root = createRoot(customCloseButton);
        root.render(<Close className="fill-icon-secondary h-5 w-5" />);

        defaultCloseButton.replaceWith(customCloseButton);
        customCloseButton.addEventListener('click', () => {
          driverObj.destroy();
        });
      },
      nextBtnText: t('onboarding.next'),
      prevBtnText: t('onboarding.prev'),
      doneBtnText: t('onboarding.done'),
      progressText: t('onboarding.progress'),
      onDestroyed: (_element, step) => {
        if (isTransitioning) return;

        if (user?.onboarding_stage === 'completed') {
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          sessionStorage.removeItem(SHOW_FOR_COMPLETED_KEY);
          setShowForCompleted(false);
          return;
        }

        const passedAllSteps = isDestroyedOnLastTourStep(step, validSteps);

        setIsTransitioning(true);

        transitionStage.mutate(undefined, {
          onSuccess: () => {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            sessionStorage.removeItem(SHOW_FOR_COMPLETED_KEY);
            setShowForCompleted(false);
            setIsTransitioning(false);

            if (passedAllSteps) {
              finishOnboardingAnalytics('tour_done');
              trackOnboardingTourCompleteLegacy(user?.default_layout);
            } else {
              finishOnboardingAnalytics('skipped', 'dismiss');
            }
          },
          onError: (error) => {
            console.error('Ошибка при завершении онбординга:', error);
            trackOnboardingStepFailed('training', userRole, error, 'training');
            setIsTransitioning(false);
          },
        });
      },
    });
    driverObj.drive();
  }, [steps, user, isTransitioning, transitionStage, t]);

  useEffect(() => {
    if (shouldShowForCompleted) {
      driverAction();
    }
  }, [shouldShowForCompleted, driverAction]);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  if ((!shouldShowForTraining && !shouldShowForCompleted) || isHidden || isTransitioning) {
    return null;
  }

  if (shouldShowForCompleted) {
    return null;
  }

  return (
    <div className="bg-background-overlay fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="bg-background-surface border-border-default relative flex w-full max-w-[500px] flex-col items-center gap-6 rounded-[20px] border p-8 shadow-[0px_16px_16px_0px_rgba(16,16,16,0.08),0px_24px_32px_0px_rgba(16,16,16,0.08)]">
        <Button
          variant="none"
          size="s"
          className="absolute top-6 right-4 rounded-3xl p-2 hover:cursor-pointer"
          onClick={hideMenuForSession}
        >
          <Close className="fill-icon-secondary h-6 w-6" />
        </Button>

        <div className="relative h-40 w-full max-w-96 overflow-hidden rounded-xl">
          <img
            src="/ui/onbording/OnbordingStartModal.svg"
            alt=""
            className="absolute top-[-9px] left-1/2 h-[173px] w-[299px] -translate-x-1/2"
          />
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          <h2 className="text-text-primary w-full text-3xl leading-9 font-semibold whitespace-nowrap">
            {t('onboarding.welcome')}
          </h2>
          <p className="text-text-secondary w-full text-base leading-5 font-normal">
            {isTutor ? t('onboarding.tutorDescription') : t('onboarding.studentDescription')}
          </p>
        </div>

        <div className="flex w-full items-center justify-end gap-3">
          <Button
            variant="none"
            type="button"
            onClick={completeOnboarding}
            className="text-text-secondary hover:text-text-primary h-12 rounded-xl px-6 text-base font-medium hover:cursor-pointer"
          >
            {isTutor ? t('onboarding.laterTutor') : t('onboarding.laterStudent')}
          </Button>
          <Button
            variant="brand"
            type="button"
            disabled={disabled}
            onClick={() => driverAction()}
            className="bg-action-primary-background-default text-text-on-accent hover:bg-action-primary-background-hover h-12 rounded-xl px-6 text-base font-medium hover:cursor-pointer"
          >
            {isTutor ? t('onboarding.startTourTutor') : t('onboarding.startTourStudent')}
          </Button>
        </div>
      </div>
    </div>
  );
};
