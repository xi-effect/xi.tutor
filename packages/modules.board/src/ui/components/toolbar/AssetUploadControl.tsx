import { useState } from 'react';
import type { Editor } from '@ibodr/draw';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Laptop, Materials } from '@xipkg/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
import { cn } from '@xipkg/utils';
import { useCurrentUser, type RetryRequest } from 'common.services';
import type { LibraryFile } from 'common.api';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { NavbarButton } from '../shared';
import { boardDropdownZClass, boardMenuItemClass, boardMenuSurfaceClass } from '../../boardTheme';
import { pickAndInsertComputerFiles } from '../../../utils/pickAndInsertComputerFiles';
import { insertLibraryFileToBoard } from '../../../utils/insertLibraryFileToBoard';
import { CloudFilesDrawer } from './CloudFilesDrawer';

type AssetUploadControlProps = {
  icon: React.ReactNode;
  title: string;
  isActive: boolean;
  editor: Editor;
  token: string;
  addToQueue: (request: Omit<RetryRequest, 'id' | 'timestamp'>) => void;
};

export const AssetUploadControl = ({
  icon,
  title,
  isActive,
  editor,
  token,
  addToQueue,
}: AssetUploadControlProps) => {
  const { t } = useTranslation('board');
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const [menuOpen, setMenuOpen] = useState(false);
  const [cloudOpen, setCloudOpen] = useState(false);

  const openComputerPicker = () => {
    pickAndInsertComputerFiles(editor, token, addToQueue);
  };

  const handleCloudSelect = async (file: LibraryFile) => {
    try {
      await insertLibraryFileToBoard(editor, file, token, addToQueue);
    } catch (error) {
      console.error('Ошибка при вставке файла из облака:', error);
      toast.error(t('navbar.cloudInsertFailed'), { duration: 5000 });
    }
  };

  if (!isTutor) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavbarButton
              icon={icon}
              title={title}
              isActive={isActive}
              data-board-tool="asset"
              onClick={openComputerPicker}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>{title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <NavbarButton
            icon={icon}
            title={title}
            isActive={isActive || menuOpen || cloudOpen}
            data-board-tool="asset"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align="center"
          sideOffset={10}
          className={cn(boardMenuSurfaceClass, boardDropdownZClass, 'min-w-52 rounded-2xl p-2')}
        >
          <DropdownMenuItem
            className={cn(boardMenuItemClass, 'cursor-pointer gap-2 rounded-lg px-3 py-2')}
            onSelect={() => {
              setMenuOpen(false);
              openComputerPicker();
            }}
            data-umami-event="board-asset-from-computer"
          >
            <Laptop className="fill-icon-secondary size-4 shrink-0" />
            {t('navbar.fromComputer')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(boardMenuItemClass, 'cursor-pointer gap-2 rounded-lg px-3 py-2')}
            onSelect={() => {
              setMenuOpen(false);
              setCloudOpen(true);
            }}
            data-umami-event="board-asset-from-cloud"
          >
            <Materials className="fill-icon-secondary size-4 shrink-0" />
            {t('navbar.fromCloud')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CloudFilesDrawer open={cloudOpen} onOpenChange={setCloudOpen} onSelect={handleCloudSelect} />
    </>
  );
};
