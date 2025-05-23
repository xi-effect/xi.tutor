import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';

export type WelcomeButtonsPropsT = {
  backButtonHandler?: () => void;
  continueButtonHandler?: () => void;
  continueType?: 'next' | 'continue';
  customText?: string;
};

export const WelcomeButtons = ({
  backButtonHandler,
  continueButtonHandler,
  continueType,
  customText,
}: WelcomeButtonsPropsT) => {
  const { t } = useTranslation('welcome');

  return (
    <menu className="mt-auto flex flex-row gap-6 pt-4">
      <Button onClick={backButtonHandler} variant="ghost" className="w-[98px]" type="button">
        {t('buttons.back_button')}
      </Button>
      <Button onClick={continueButtonHandler} className="w-full" type="submit">
        {customText ||
          (continueType === 'next' ? t('buttons.next_button') : t('buttons.continue_button'))}
      </Button>
    </menu>
  );
};
