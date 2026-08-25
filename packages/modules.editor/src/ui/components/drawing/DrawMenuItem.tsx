import { DropdownMenuItem } from '@xipkg/dropdown';
import { Edit } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

type DrawMenuItemPropsT = { onSelect: () => void };

export const DrawMenuItem = ({ onSelect }: DrawMenuItemPropsT) => {
  const { t } = useTranslation('editor');

  return (
    <DropdownMenuItem
      className={cn('hover:bg-background-page h-7 gap-2 rounded p-1')}
      onSelect={onSelect}
    >
      <Edit size="sm" className="size-6" />
      {t('media.draw')}
    </DropdownMenuItem>
  );
};
