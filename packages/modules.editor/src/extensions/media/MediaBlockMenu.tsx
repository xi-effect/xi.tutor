import { NodeViewWrapper } from '@tiptap/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@xipkg/dropdown';
import { Button } from '@xipkg/button';
import { ArrowBottom, ArrowUp, Copy, Download, MoreVert, Trash } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';
import { Editor } from '@tiptap/core';
import { useBlockMenuActions } from '../../hooks';
import { ActiveBlockT } from '../../types';
import { cn } from '@xipkg/utils';

type MediaBlockMenuProps = {
  editor: Editor | null;
  getActiveBlock: () => ActiveBlockT | undefined;
  isReadOnly?: boolean;
  onDownload: () => void;
  extraItems?: ReactNode;
  className?: string;
};

export const MediaBlockMenu = ({
  editor,
  getActiveBlock,
  isReadOnly,
  onDownload,
  extraItems,
  className,
}: MediaBlockMenuProps) => {
  const { t } = useTranslation('editor');
  const { duplicate, remove, moveDown, moveUp } = useBlockMenuActions(editor, getActiveBlock);

  return (
    <div
      className={cn(
        'pointer-events-none absolute top-2 right-2 z-10 flex opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100',
        className,
      )}
    >
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button size="s" variant="none" className="rounded-lg px-2">
            <MoreVert size="sm" className="size-6" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="bottom"
          align="end"
          className="flex w-[260px] flex-col space-y-1 p-2"
        >
          <DropdownMenuItem
            className="hover:bg-background-page h-7 gap-2 rounded p-1"
            onSelect={onDownload}
          >
            <Download size="sm" className="size-6" />
            <span className="text-sm">{t('media.download')}</span>
          </DropdownMenuItem>

          {!isReadOnly && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="hover:bg-background-page h-7 gap-2 rounded p-1"
                onSelect={(e) => {
                  e.preventDefault();
                  moveUp();
                }}
              >
                <ArrowUp size="sm" className="size-6" />
                <span className="text-sm">{t('media.moveUp')}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="hover:bg-background-page h-7 gap-2 rounded p-1"
                onSelect={(e) => {
                  e.preventDefault();
                  moveDown();
                }}
              >
                <ArrowBottom size="sm" className="size-6" />
                <span className="text-sm">{t('media.moveDown')}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="hover:bg-background-page h-7 gap-2 rounded p-1"
                onSelect={duplicate}
              >
                <Copy size="sm" className="size-6" />
                <span className="text-sm">{t('media.duplicate')}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="hover:bg-background-page h-7 gap-2 rounded p-1"
                onSelect={remove}
              >
                <Trash size="sm" className="size-6" />
                <span className="text-sm">{t('media.delete')}</span>
              </DropdownMenuItem>
            </>
          )}
          {extraItems}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export { NodeViewWrapper };
