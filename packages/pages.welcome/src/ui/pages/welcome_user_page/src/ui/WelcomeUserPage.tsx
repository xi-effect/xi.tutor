import { WelcomeUserForm } from './WelcomeUserForm';
import { useTranslation } from 'react-i18next';
import { WelcomeUserAvatar } from './WelcomeUserAvatar';
import { WelcomePageLayout } from '../../../../WelcomePageLayout';

export const WelcomeUserPage = () => {
  const { t } = useTranslation('welcomeUser');

  return (
    <WelcomePageLayout step={1} title={t('title')}>
      <WelcomeUserAvatar />
      <WelcomeUserForm />
    </WelcomePageLayout>
  );
};
