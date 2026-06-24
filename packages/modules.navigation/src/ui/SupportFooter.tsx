import { useSupportModalStore } from 'common.ui';
import { AuthSupportLink } from './AuthSupportLink';
import { SupportModal } from './SupportModal';

export const SupportFooter = () => {
  const isSupportOpen = useSupportModalStore((s) => s.isOpen);
  const setSupportOpen = useSupportModalStore((s) => s.setOpen);

  return (
    <>
      <div className="fixed inset-x-0 bottom-6 z-10 flex justify-center pb-[env(safe-area-inset-bottom)]">
        <AuthSupportLink />
      </div>
      <SupportModal open={isSupportOpen} onOpenChange={setSupportOpen} />
    </>
  );
};
