import type { MathTaskSearchDocument } from 'features.math.bank';
import { MathBankPicker } from 'pages.bank/picker';
import { useTranslation } from 'react-i18next';
import { boardChromeZClass, boardDropdownZClass } from '../../boardTheme';

type MathBankDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (task: MathTaskSearchDocument) => void | Promise<void>;
};

export const MathBankDrawer = ({ open, onOpenChange, onSelect }: MathBankDrawerProps) => {
  const { t } = useTranslation('board');

  return (
    <MathBankPicker
      open={open}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
      addLabel={t('navbar.mathBankAddToBoard')}
      description={t('navbar.mathBankDescription')}
      overlayClassName={boardDropdownZClass}
      contentClassName={boardDropdownZClass}
      chromeClassName={boardChromeZClass}
      umamiPrefix="board"
      analyticsSource="board"
    />
  );
};
