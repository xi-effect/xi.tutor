import { MessageHeartCircle } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import { useSupportModalStore } from 'common.ui';
import {
  PRODUCT_ANALYTICS_EVENTS,
  inferActivationHelpScreen,
  trackProductEvent,
} from 'common.utils';

export const AuthSupportLink = () => {
  const { t } = useTranslation('navigation');
  const openSupportModal = useSupportModalStore((state) => state.open);

  const handleOpenSupport = () => {
    const screen = inferActivationHelpScreen();
    if (screen === 'signup' || screen === 'email_confirmation' || screen === 'onboarding') {
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.ACTIVATION_HELP_OPENED, {
        screen,
        reason: 'need_help',
      });
    }
    openSupportModal();
  };

  return (
    <button
      type="button"
      onClick={handleOpenSupport}
      className="hover:bg-background-page dark:hover:bg-background-subtle focus-visible:bg-background-page dark:focus-visible:bg-background-subtle flex items-center gap-2 rounded-lg bg-transparent px-3 py-2 focus-visible:outline-none"
      data-umami-event="navigation-support"
    >
      <MessageHeartCircle className="hover:text-text-secondary! focus:text-text-secondary! text-text-secondary! dark:text-text-muted! dark:hover:text-text-muted! dark:focus:text-text-muted! size-6 shrink-0" />
      <span className="text-s-base hover:text-text-secondary! focus:text-text-secondary! text-text-secondary! dark:text-text-muted! dark:hover:text-text-muted! dark:focus:text-text-muted! font-medium">
        {t('support')}
      </span>
    </button>
  );
};
