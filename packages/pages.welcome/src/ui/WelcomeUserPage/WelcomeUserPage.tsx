import { WelcomeUserForm } from './WelcomeUserForm';
import { useTranslation } from 'react-i18next';
import { WelcomeUserAvatar } from './WelcomeUserAvatar';
import { WelcomePageLayout } from '../WelcomePageLayout';
import { useOnboardingAnalytics } from '../../hooks/useOnboardingAnalytics';

export const WelcomeUserPage = () => {
  const { t } = useTranslation('welcomeUser');
  useOnboardingAnalytics({ step: 'profile' });

  return (
    <WelcomePageLayout step={1} title={t('title')}>
      <WelcomeUserAvatar />
      <WelcomeUserForm />
    </WelcomePageLayout>
  );
};
