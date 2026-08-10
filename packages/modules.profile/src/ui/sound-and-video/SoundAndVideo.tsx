import { PermissionsDialog, SoundAndVideoSettings } from 'modules.calls';
import { useMediaQuery } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

export const SoundAndVideo = () => {
  const { t } = useTranslation('profile');
  const isMobile = useMediaQuery('(max-width: 719px)');

  return (
    <>
      {!isMobile && (
        <h1 className="dark:text-text-primary mb-4 text-3xl font-semibold">
          {t('soundAndVideo.title')}
        </h1>
      )}
      <SoundAndVideoSettings />
      <PermissionsDialog />
    </>
  );
};
