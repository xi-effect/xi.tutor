import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { cn } from '@xipkg/utils';

const menuSurfaceClass = 'border-border-default bg-background-surface border';
const menuItemClass =
  'text-text-primary hover:bg-status-info-background hover:text-text-primary focus:text-text-primary h-8 items-center whitespace-nowrap rounded-lg px-2 py-0 text-sm leading-none';

type FileActionsMenuProps = {
  children: ReactNode;
  onDelete: () => void;
  showDownload?: boolean;
  isDownloading?: boolean;
  onDownload?: () => void;
  modal?: boolean;
  contentClassName?: string;
  downloadUmami?: string;
  deleteUmami?: string;
};

export const FileActionsMenu = ({
  children,
  onDelete,
  showDownload = false,
  isDownloading,
  onDownload,
  modal = false,
  contentClassName,
  downloadUmami = 'materials-file-download',
  deleteUmami = 'materials-file-delete',
}: FileActionsMenuProps) => {
  const { t } = useTranslation('materials');

  return (
    <DropdownMenu modal={modal}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        className={cn(
          menuSurfaceClass,
          'text-text-primary pointer-events-auto z-100 w-56 space-y-1 rounded-lg p-2 font-normal',
          contentClassName,
        )}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {showDownload ? (
          <DropdownMenuItem
            className={menuItemClass}
            disabled={isDownloading}
            onClick={onDownload}
            data-umami-event={downloadUmami}
          >
            {t('files.menu.download')}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          className={cn(menuItemClass, 'w-full')}
          onClick={onDelete}
          data-umami-event={deleteUmami}
        >
          {t('files.menu.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
