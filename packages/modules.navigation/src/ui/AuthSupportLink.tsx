import { MessageHeartCircle } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { useSupportModalStore } from 'common.ui';
import {
  PRODUCT_ANALYTICS_EVENTS,
  inferActivationHelpScreen,
  trackProductEvent,
} from 'common.utils';

type AuthSupportLinkProps = {
  label?: string;
  className?: string;
  onBeforeOpen?: () => void;
};

export const AuthSupportLink = ({ label, className, onBeforeOpen }: AuthSupportLinkProps) => {
  const { t } = useTranslation('navigation');
  const openSupportModal = useSupportModalStore((state) => state.open);

  const handleOpenSupport = () => {
    onBeforeOpen?.();

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
      className={cn(
        'hover:bg-background-page dark:hover:bg-background-subtle focus-visible:bg-background-page dark:focus-visible:bg-background-subtle flex items-center gap-2 rounded-lg bg-transparent px-3 py-2 focus-visible:outline-none',
        className,
      )}
      data-umami-event="navigation-support"
    >
      <MessageHeartCircle className="hover:text-text-secondary! focus:text-text-secondary! text-text-secondary! dark:text-text-muted! dark:hover:text-text-muted! dark:focus:text-text-muted! size-6 shrink-0" />
      <span className="text-s-base hover:text-text-secondary! focus:text-text-secondary! text-text-secondary! dark:text-text-muted! dark:hover:text-text-muted! dark:focus:text-text-muted! font-medium">
        {label ?? t('support')}
      </span>
    </button>
  );
};
