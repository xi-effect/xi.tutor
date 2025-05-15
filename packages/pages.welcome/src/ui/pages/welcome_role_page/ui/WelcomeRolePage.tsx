import { useRef, useState, useLayoutEffect, useMemo, type RefObject } from 'react';
import { WelcomeRoleButton } from './WecomeRoleButton';
import { useTranslation } from 'react-i18next';
import { WelcomePageLayout } from '../../../WelcomePageLayout';
import { WelcomeButtons } from '../../../WelcomeButtons';
import { useRouter, useCanGoBack, useNavigate } from '@tanstack/react-router';

export const WelcomeRolePage = () => {
  const { t } = useTranslation('welcomeRole');
  const firstButton = useRef<HTMLButtonElement>(null);
  const secondButton = useRef<HTMLButtonElement>(null);
  const thirdButton = useRef<HTMLButtonElement>(null);

  const getHeight = (elem: RefObject<HTMLButtonElement | null>) =>
    elem.current ? Number(elem.current.clientHeight) : 0;

  const buttons = useMemo(
    () => [
      {
        ref: firstButton,
        tab: 0,
        top: 0,
        text: 'Репетитор',
      },
      {
        ref: secondButton,
        tab: 1,
        top: getHeight(firstButton),
        text: 'Ученик',
      },
      {
        ref: thirdButton,
        tab: 2,
        top: (getHeight(firstButton) + getHeight(secondButton)) | 0,
        text: 'Родитель',
      },
    ],
    [],
  );

  const [activeButton, setActiveButton] = useState(buttons[0]);

  const onButtonClick = (index: number) => () => {
    if (buttons[index]) setActiveButton(buttons[index]);
  };

  useLayoutEffect(() => {
    buttons[1].top = getHeight(firstButton);
    buttons[2].top = (getHeight(firstButton) + getHeight(secondButton)) | 0;
  }, [buttons]);

  // Временные хэндлеры (на период, пока не подключен бэкенд)
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const navigate = useNavigate();
  const backButtonHandler = () => canGoBack && router.history.back();
  const continueButtonHandler = () =>
    navigate({
      to: '/welcome/about',
    });

  return (
    <WelcomePageLayout step={2} title={t('title')} subtitle={t('subtitle')}>
      <div className="border-gray-30 bg-gray-0 relative mt-6 flex w-full flex-col items-start rounded-2xl border">
        <div
          style={{ height: getHeight(activeButton.ref) || '60px', top: activeButton.top }}
          className="border-brand-100 bg-brand-0 absolute ml-0 flex w-full cursor-pointer flex-row items-start justify-start gap-2 rounded-2xl border border-solid p-4 transition-all duration-300 ease-in"
        />
        <ul className="flex w-full flex-col">
          {buttons.map((button, index) => (
            <li key={index}>
              <WelcomeRoleButton
                buttonData={button}
                onButtonClick={onButtonClick(index)}
                active={index === activeButton.tab}
              />
            </li>
          ))}
        </ul>
      </div>
      <WelcomeButtons
        continueButtonHandler={continueButtonHandler}
        backButtonHandler={backButtonHandler}
      />
    </WelcomePageLayout>
  );
};
