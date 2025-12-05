import { Close } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import '../utils/driver.css';
import { createRoot } from 'react-dom/client';
import { useCurrentUser, useOnboardingTransition } from 'common.services';
import { useState, useEffect } from 'react';

type MenuT = {
  disabled?: boolean;
  steps?: DriveStep[];
};

const SESSION_STORAGE_KEY = 'onboarding_menu_hidden';
const SHOW_FOR_COMPLETED_KEY = 'show_onboarding_for_completed';

export const Menu = ({ disabled = false, steps = [] }: MenuT) => {
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

  // Если данные пользователя загружаются, не показываем меню
  if (isLoading) {
    return null;
  }

  // Если пользователь не найден, не показываем меню
  if (!user) {
    return null;
  }

  const shouldShowForCompleted = user.onboarding_stage === 'completed' && showForCompleted;
  const shouldShowForTraining = user.onboarding_stage === 'training';

  if ((!shouldShowForTraining && !shouldShowForCompleted) || isHidden || isTransitioning) {
    return null;
  }

  const isTutor = user?.default_layout === 'tutor';

  const driverAction = () => {
    // Скрываем меню при начале обучения
    hideMenuForSession();

    // Фильтруем шаги, оставляя только те, элементы которых существуют на странице
    const validSteps = steps.filter((step) => {
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
      doneBtnText: 'Завершить',
      progressText: '{{current}} из {{total}}',
      onDestroyed: () => {
        // Защита от повторных вызовов
        if (isTransitioning) return;

        if (user?.onboarding_stage === 'completed') {
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          sessionStorage.removeItem(SHOW_FOR_COMPLETED_KEY);
          setShowForCompleted(false);
          return;
        }

        setIsTransitioning(true);

        // Обновляем статус онбординга на 'completed' при завершении
        transitionStage.mutate(undefined, {
          onSuccess: () => {
            // Очищаем sessionStorage при успешном завершении онбординга
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            sessionStorage.removeItem(SHOW_FOR_COMPLETED_KEY);
            setShowForCompleted(false);
            setIsTransitioning(false);
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
  };

  return (
    <>
      <div className="bg-gray-0 border-gray-10 fixed bottom-0 left-72 z-100 mb-6 flex w-[calc(100vw-2rem)] max-w-[400px] -translate-x-1/2 transform flex-col items-start gap-6 rounded-2xl border-2 p-4 shadow-2xl sm:w-[400px]">
        <Button
          variant="ghost"
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
            className="bg-brand-80 text-gray-0 flex h-[32px] max-w-[177px] items-center justify-center rounded-lg pl-4 text-sm font-medium hover:cursor-pointer"
          >
            {isTutor ? 'Пройти обучение' : 'Смотреть подсказки'}
          </Button>
          <Button
            variant="ghost"
            type="button"
            disabled={undefined}
            onClick={completeOnboarding}
            size="s"
            className="hover:bg-gray-5 border-gray-30 flex h-[32px] max-w-[153px] items-center justify-center rounded-lg border pl-4 text-sm font-medium hover:cursor-pointer"
          >
            {isTutor ? 'Вернуться позже' : 'Позже'}
          </Button>
        </div>
      </div>
    </>
  );
};
