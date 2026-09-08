import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';

export const ScreenBackButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation('subscription');

  return (
    <Button
      type="button"
      variant="ghost"
      size="s"
      className="text-text-secondary mb-3 h-8 self-start px-0"
      onClick={onClick}
    >
      {t('compare.back')}
    </Button>
  );
};
