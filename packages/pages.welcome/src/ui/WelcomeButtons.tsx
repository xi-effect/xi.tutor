import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';

export type WelcomeButtonsPropsT = {
  backButtonHandler?: () => void;
  continueButtonHandler?: () => void;
  continueType?: 'next' | 'continue';
  customText?: string;
  isLoading?: boolean;
};

export const WelcomeButtons = ({
  backButtonHandler,
  continueButtonHandler,
  continueType,
  customText,
  isLoading,
}: WelcomeButtonsPropsT) => {
  const { t } = useTranslation('welcome');

  return (
    <menu className="mt-auto flex flex-row gap-6 pt-4">
      <Button
        onClick={backButtonHandler}
        variant="ghost"
        className="w-[98px]"
        type="button"
        disabled={isLoading}
        data-umami-event="welcome-back-button"
      >
        {t('buttons.back_button')}
      </Button>
      <Button
        onClick={continueButtonHandler}
        className="w-full"
        type="submit"
        disabled={isLoading}
        data-umami-event={
          continueType === 'next' ? 'welcome-next-button' : 'welcome-continue-button'
        }
      >
        {customText ||
          (continueType === 'next' ? t('buttons.next_button') : t('buttons.continue_button'))}
      </Button>
    </menu>
  );
};
