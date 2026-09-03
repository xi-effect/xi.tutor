import type { LibraryFile } from 'common.services';
import { CloudFilesPicker } from 'pages.materials';
import { useTranslation } from 'react-i18next';
import { boardChromeZClass, boardDropdownZClass } from '../../boardTheme';

type CloudFilesDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (file: LibraryFile) => void | Promise<void>;
};

export const CloudFilesDrawer = ({ open, onOpenChange, onSelect }: CloudFilesDrawerProps) => {
  const { t } = useTranslation('board');

  return (
    <CloudFilesPicker
      open={open}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
      addLabel={t('navbar.cloudAddToBoard')}
      description={t('navbar.cloudFilesDescription')}
      overlayClassName={boardDropdownZClass}
      contentClassName={boardDropdownZClass}
      chromeClassName={boardChromeZClass}
      umamiPrefix="board"
    />
  );
};
