import { useSupportModalStore } from 'common.ui';
import { AuthSupportLink } from './AuthSupportLink';
import { SupportModal } from './SupportModal';

export const SupportFooter = () => {
  const isSupportOpen = useSupportModalStore((s) => s.isOpen);
  const setSupportOpen = useSupportModalStore((s) => s.setOpen);

  return (
    <>
      <div className="flex shrink-0 justify-center py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <AuthSupportLink />
      </div>
      <SupportModal open={isSupportOpen} onOpenChange={setSupportOpen} />
    </>
  );
};
