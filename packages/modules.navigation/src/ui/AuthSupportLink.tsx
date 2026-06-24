import { MessageHeartCircle } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import { useSupportModalStore } from 'common.ui';

export const AuthSupportLink = () => {
  const { t } = useTranslation('navigation');
  const openSupportModal = useSupportModalStore((state) => state.open);

  return (
    <button
      type="button"
      onClick={openSupportModal}
      className="hover:bg-gray-5 dark:hover:bg-gray-10 focus-visible:bg-gray-5 dark:focus-visible:bg-gray-10 flex items-center gap-2 rounded-lg bg-transparent px-3 py-2 focus-visible:outline-none"
      data-umami-event="navigation-support"
    >
      <MessageHeartCircle className="hover:text-gray-60! focus:text-gray-60! text-gray-60! size-6 shrink-0 dark:text-gray-50! dark:hover:text-gray-50! dark:focus:text-gray-50!" />
      <span className="text-s-base hover:text-gray-60! focus:text-gray-60! text-gray-60! font-medium dark:text-gray-50! dark:hover:text-gray-50! dark:focus:text-gray-50!">
        {t('support')}
      </span>
    </button>
  );
};
