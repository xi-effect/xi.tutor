import { Close } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import '../utils/driver.css';
import { createRoot } from 'react-dom/client';
import { useCurrentUser, useOnboardingTransition } from 'common.services';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@xipkg/utils';

type OnboardingPopupT = {
  disabled?: boolean;
  steps?: DriveStep[];
};

const buttonClassName =
  'flex h-[32px] items-center justify-center rounded-lg text-sm font-medium hover:cursor-pointer';

const SESSION_STORAGE_KEY = 'onboarding_menu_hidden';
const SHOW_FOR_COMPLETED_KEY = 'show_onboarding_for_completed';

function trackOnboardingTourComplete(layout: string | undefined) {
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

export const OnboardingPopup = ({ disabled = false, steps = [] }: OnboardingPopupT) => {
  const { data: user, isLoading } = useCurrentUser();
  const [isHidden, setIsHidden] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showForCompleted, setShowForCompleted] = useState(false);
  const { transitionStage } = useOnboardingTransition('completed', 'forwards');

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

  // Функция для скрытия меню
  const hideMenuForSession = () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    sessionStorage.removeItem(SHOW_FOR_COMPLETED_KEY);
    setIsHidden(true);
    setShowForCompleted(false);
  };

  const completeOnboarding = () => {
    hideMenuForSession();

    if (user?.onboarding_stage === 'completed') {
      return;
    }

    setIsTransitioning(true);

    transitionStage.mutate(undefined, {
      onSuccess: () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setIsTransitioning(false);
      },
      onError: (error) => {
        console.error('Ошибка при завершении онбординга:', error);
        setIsTransitioning(false);
      },
    });
  };

  const isTutor = user?.default_layout === 'tutor';
  const shouldShowForCompleted = user?.onboarding_stage === 'completed' && showForCompleted;
  const shouldShowForTraining = user?.onboarding_stage === 'training';

  const driverAction = useCallback(() => {
    // Скрываем меню при начале обучения
    hideMenuForSession();

    // Фильтруем шаги, оставляя только те, элементы которых существуют на странице и у которых есть описание
    const validSteps = steps.filter((step) => {
      if (!step.popover?.description || step.popover.description.trim() === '') {
        return false;
      }

      if (typeof step.element === 'string') {
        const element = document.querySelector(step.element);
        return element !== null;
      }
      // Если element не строка (например, функция или HTMLElement), оставляем шаг
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
      // Можно показать уведомление пользователю или пропустить обучение
    }

    // Если нет валидных шагов, пропускаем обучение
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
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          sessionStorage.removeItem(SHOW_FOR_COMPLETED_KEY);
          setShowForCompleted(false);
          setIsTransitioning(false);
        },
        onError: (error) => {
          console.error('Ошибка при завершении онбординга:', error);
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

        // Создаем корень для рендеринга компонента
        const root = createRoot(customCloseButton);
        root.render(<Close size="s" className="fill-gray-60 h-4 w-4" />);

        defaultCloseButton.replaceWith(customCloseButton);
        customCloseButton.addEventListener('click', () => {
          driverObj.destroy();
        });
      },
      nextBtnText: 'Продолжить',
      prevBtnText: 'Назад',
      doneBtnText: 'Закрыть',
      progressText: '{{current}} из {{total}}',
      onDestroyed: (_element, step) => {
        // Защита от повторных вызовов
        if (isTransitioning) return;

        if (user?.onboarding_stage === 'completed') {
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          sessionStorage.removeItem(SHOW_FOR_COMPLETED_KEY);
          setShowForCompleted(false);
          return;
        }

        const lastIndex = validSteps.length - 1;
        const passedAllSteps =
          lastIndex >= 0 && step !== undefined && validSteps.indexOf(step) === lastIndex;

        setIsTransitioning(true);

        // Обновляем статус онбординга на 'completed' при завершении
        transitionStage.mutate(undefined, {
          onSuccess: () => {
            // Очищаем sessionStorage при успешном завершении онбординга
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            sessionStorage.removeItem(SHOW_FOR_COMPLETED_KEY);
            setShowForCompleted(false);
            setIsTransitioning(false);
            if (passedAllSteps) {
              trackOnboardingTourComplete(user?.default_layout);
            }
          },
          onError: (error) => {
            console.error('Ошибка при завершении онбординга:', error);
            setIsTransitioning(false);
            // Можно показать уведомление пользователю
          },
        });
      },
    });
    driverObj.drive();
  }, [steps, user, isTransitioning, transitionStage]);

  useEffect(() => {
    if (shouldShowForCompleted) {
      driverAction();
    }
  }, [shouldShowForCompleted, driverAction]);

  // Если данные пользователя загружаются, не показываем меню
  if (isLoading) {
    return null;
  }

  // Если пользователь не найден, не показываем меню
  if (!user) {
    return null;
  }

  if ((!shouldShowForTraining && !shouldShowForCompleted) || isHidden || isTransitioning) {
    return null;
  }

  // Для пользователей с 'completed' не показываем меню, только запускаем обучение
  if (shouldShowForCompleted) {
    return null;
  }

  return (
    <div className="bg-gray-0 border-gray-10 fixed bottom-0 left-72 z-100 mb-6 flex w-[calc(100vw-2rem)] max-w-[400px] -translate-x-1/2 transform flex-col items-start gap-6 rounded-2xl border-2 p-4 shadow-2xl sm:w-[400px]">
      <Button
        variant="none"
        size="s"
        className="hover:bg-gray-0 bg-gray-0 absolute top-1 right-1 hover:cursor-pointer"
        onClick={hideMenuForSession}
      >
        <Close className="fill-gray-60 h-4 w-4" />
      </Button>
      <div className="flex flex-col gap-2">
        <div className="h-8">
          <span className="text-xl font-semibold text-gray-100">
            Добро пожаловать в Sovlium! 😊
          </span>
        </div>
        <div className="h-10">
          <span className="text-gray-80 text-sm font-normal tracking-tight">
            {isTutor ? (
              <>
                Хотите узнать о возможностях платформы?
                <br />
                Вы сможете вернуться к обучению в любой момент
              </>
            ) : (
              <>Подсказать, как всё устроено?</>
            )}
          </span>
        </div>
      </div>
      <div className="flex flex-row-reverse gap-4">
        <Button
          variant="brand"
          type="button"
          disabled={disabled}
          onClick={() => driverAction()}
          size="s"
          className={cn(
            buttonClassName,
            'bg-brand-80 text-gray-0',
            isTutor ? 'max-w-[153px]' : 'max-w-[177px]',
          )}
        >
          {isTutor ? 'Пройти обучение' : 'Смотреть подсказки'}
        </Button>
        <Button
          variant="none"
          type="button"
          disabled={undefined}
          onClick={completeOnboarding}
          size="s"
          className={cn(
            buttonClassName,
            'hover:bg-gray-5 border-gray-30 border',
            isTutor ? 'max-w-[153px]' : 'max-w-[78px]',
          )}
        >
          {isTutor ? 'Вернуться позже' : 'Позже'}
        </Button>
      </div>
    </div>
  );
};
