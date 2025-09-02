import { Close } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import '../utils/driver.css';
import { createRoot } from 'react-dom/client';

type MenuT = {
  disabled?: boolean;
  steps?: DriveStep[];
};

export const Menu = ({ disabled = false, steps = [] }: MenuT) => {
  const driverAction = () => {
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
    });
    driverObj.drive();
  };

  return (
    <>
      <div className="bg-gray-0 border-gray-10 fixed bottom-0 mb-6 flex flex-col gap-6 rounded-2xl border-2 p-4 sm:w-[400px]">
        <Button
          variant="ghost"
          size={'s'}
          className="hover:bg-gray-0 bg-gray-0 absolute top-1 right-1 hover:cursor-pointer"
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
            onClick={() => null}
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
