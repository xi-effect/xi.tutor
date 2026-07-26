import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';

interface FileProps {
  onUpload: () => void;
}

export const File = ({ onUpload }: FileProps) => {
  const { t } = useTranslation('materialsAdd');

  return (
    <Button
      onClick={onUpload}
      size="s"
      variant="none"
      className="text-s-base text-text-primary rounded-lg px-4 py-2 font-medium max-sm:hidden"
    >
      {t('file.upload')}
    </Button>
  );
};
