import { Close, Objects } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { createRoot } from 'react-dom/client';

type MenuT = {
  disabled: boolean;
  steps: [];
};

export const Menu = ({ disabled, steps }: MenuT) => {
  const driverAction = () => {
    const driverObj = driver({
      popoverClass: 'my-custom-popover-class',
      showProgress: true,
      steps: steps,

      // Пример использования steps, если нужно добавить шаги
      // steps: [
      //   {
      //     element: '',
      //     popover: {
      //       title: 'Welcome to the Menu',
      //       description: 'This is a brief introduction to the menu features
      //     },
      //   },
      //   {
      //     element: '',
      //     popover: {
      //       title: 'Welcome to the Menu',
      //       description: 'This is a brief introduction to the menu features.
      //     },
      //   },
      // ],
      onPopoverRender: (popover) => {
        const defaultCloseButton = popover.closeButton;
        const customCloseButton = document.createElement('button');
        customCloseButton.className = 'driver-popover-close-btn';

        // Создаем корень для рендеринга компонента
        const root = createRoot(customCloseButton);
        root.render(<Close size="s" className="fill-gray-60" />);

        defaultCloseButton.replaceWith(customCloseButton);
        customCloseButton.addEventListener('click', () => {
          driverObj.destroy();
        });
      },
      nextBtnText: 'Продолжить',
      prevBtnText: 'Назад',
      doneBtnText: 'Завершить',
      progressText: '{{current}} из {{total}}',
    });
    driverObj.drive();
  };

  return (
    <Button
      variant="ghost"
      type="button"
      disabled={disabled}
      onClick={() => driverAction()}
      className="hover:bg-gray-5 mt-1 flex h-[48px] w-full flex-row items-center justify-start rounded-lg p-2 pl-4 hover:cursor-pointer"
    >
      <Objects size="s" className="h-4 w-4 group-hover:fill-gray-100" />
      <span className="pl-2 text-[14px] font-normal">Пройти обучение</span>
    </Button>
  );
};
