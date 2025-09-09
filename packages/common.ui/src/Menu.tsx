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

export const Menu = ({ disabled = false, steps = [] }: MenuT) => {
  const { data: user, isLoading } = useCurrentUser();
  const [isHidden, setIsHidden] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { transitionStage } = useOnboardingTransition('completed', 'forwards');

  // Проверяем sessionStorage при загрузке компонента
  useEffect(() => {
    const hiddenInSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (hiddenInSession === 'true') {
      setIsHidden(true);
    }
  }, []);

  // Функция для скрытия меню в рамках сессии
  const hideMenuForSession = () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    setIsHidden(true);
  };

  // Если данные пользователя загружаются, не показываем меню
  if (isLoading) {
    return null;
  }

  // Если пользователь не найден, не показываем меню
  if (!user) {
    return null;
  }

  // // Если onboarding_stage не "training" или меню скрыто в сессии, не показываем
  if (user.onboarding_stage !== 'training' || isHidden || isTransitioning) {
    return null;
  }

  const driverAction = () => {
    // Скрываем меню при начале обучения
    hideMenuForSession();

    // Проверяем, что все необходимые элементы существуют
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

    const driverObj = driver({
      popoverClass: 'my-custom-popover-class',
      showProgress: true,
      steps: steps,

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

        setIsTransitioning(true);

        // Обновляем статус онбординга на 'completed' при завершении
        transitionStage.mutate(undefined, {
          onSuccess: () => {
            // Очищаем sessionStorage при успешном завершении онбординга
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
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
      <div className="bg-gray-0 border-gray-10 fixed bottom-0 left-1/2 mb-6 flex w-[calc(100vw-2rem)] max-w-[400px] -translate-x-1/2 transform flex-col gap-6 rounded-2xl border-2 p-4 shadow-2xl sm:w-[400px]">
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
              Хотите узнать о возможностях платформы?
              <br />
              Вы сможете вернуться к обучению в любой момент.
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
            className="bg-brand-80 text-gray-0 mt-1 flex h-[32px] w-[153px] flex-row items-center justify-start rounded-lg p-2 hover:cursor-pointer"
          >
            <span className="pl-2 text-[14px] font-medium">Пройти обучение</span>
          </Button>
          <Button
            variant="ghost"
            type="button"
            disabled={undefined}
            onClick={hideMenuForSession}
            size="s"
            className="hover:bg-gray-5 border-gray-30 mt-1 flex h-[32px] w-[153px] flex-row items-center justify-start rounded-lg border p-2 hover:cursor-pointer"
          >
            <span className="pl-2 text-[14px] font-medium">Вернуться позже</span>
          </Button>
        </div>
      </div>
    </>
  );
};
