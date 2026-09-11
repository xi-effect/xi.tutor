import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Code, File, Image, Laptop, Link as LinkIcon, Materials, BookOpened } from '@xipkg/icons';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@xipkg/utils';
import { useCurrentUser } from 'common.services';
import { useBlockMenuActions, useYjsContext } from '../../hooks';
import { Editor } from '@tiptap/core';
import { useInterfaceStore } from '../../store/interfaceStore';
import { ActiveBlockT } from '../../types';
import { pickAndInsertComputerFiles } from '../../utils/pickAndInsertComputerFiles';
import { BLOCK_OP_ACTIONS, INSERT_BLOCK_ACTIONS, type BlockOpKey } from '../../config/blockActions';

const menuItemClass =
  'text-text-primary hover:bg-background-page focus:text-text-primary fill-icon-primary [&_svg]:fill-icon-primary h-7 gap-2 rounded p-1 text-sm';

const menuSubTriggerClass = cn(
  menuItemClass,
  'relative pr-8',
  'data-[state=open]:bg-background-page',
  '[&>svg:last-child]:pointer-events-none [&>svg:last-child]:absolute [&>svg:last-child]:top-1/2 [&>svg:last-child]:right-1',
  '[&>svg:last-child]:size-4 [&>svg:last-child]:!m-0 [&>svg:last-child]:-translate-y-1/2',
  '[&>svg:last-child]:!fill-none [&>svg:last-child]:stroke-icon-primary',
);

const menuContentClass =
  'border-border-default bg-background-surface text-text-primary flex w-auto flex-col gap-1 space-y-1 rounded-lg border p-2';

type BlockMenuPropsT = {
  children: ReactNode;
  editor: Editor;
  isReadOnly?: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  getActiveBlock: () => ActiveBlockT | undefined;
};

function deferAction(fn: () => void) {
  return (e: Event) => {
    e.preventDefault();
    setTimeout(fn, 0);
  };
}

export const BlockMenu = ({
  children,
  editor,
  isReadOnly,
  open,
  setOpen,
  getActiveBlock,
}: BlockMenuPropsT) => {
  const { t } = useTranslation('editor');
  const isMac = navigator.platform.toUpperCase().includes('MAC');
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const { openModal, openCloudPicker, openMathBankPicker } = useInterfaceStore();
  const { storageItem } = useYjsContext();
  const { insertBlock, duplicate, remove, moveUp, moveDown, insertCode } = useBlockMenuActions(
    editor,
    getActiveBlock,
  );

  const opHandlers: Record<BlockOpKey, () => void> = {
    duplicate,
    moveUp,
    moveDown,
    delete: remove,
  };

  const shouldShow = editor && !isReadOnly && editor.isEditable !== false;

  if (!shouldShow) {
    return null;
  }

  const pickFromComputer = (mode: 'image' | 'file') => {
    pickAndInsertComputerFiles(editor, storageItem.content_token, getActiveBlock(), mode);
  };

  const pickFromCloud = () => {
    openCloudPicker(getActiveBlock());
  };

  const pickFromMathBank = () => {
    void import('pages.bank/picker');
    openMathBankPicker(getActiveBlock());
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
        className={menuContentClass}
      >
        {INSERT_BLOCK_ACTIONS.map(({ type, labelKey, Icon }) => (
          <DropdownMenuItem key={type} className={menuItemClass} onSelect={() => insertBlock(type)}>
            <Icon size="sm" className="size-6" />
            <span>{t(labelKey)}</span>
          </DropdownMenuItem>
        ))}

        {isTutor ? (
          <DropdownMenuItem
            className={menuItemClass}
            onSelect={pickFromMathBank}
            data-umami-event="editor-math-bank-open"
          >
            <BookOpened size="sm" className="size-6" />
            <span>{t('blockMenu.fromMathBank')}</span>
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={menuSubTriggerClass}>
            <File size="sm" className="size-6" />
            <span>{t('blockMenu.file')}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className={menuContentClass}>
            <DropdownMenuItem className={menuItemClass} onSelect={() => pickFromComputer('file')}>
              <Laptop size="sm" className="size-6" />
              <span>{t('blockMenu.fromComputer')}</span>
            </DropdownMenuItem>
            {isTutor ? (
              <DropdownMenuItem className={menuItemClass} onSelect={pickFromCloud}>
                <Materials size="sm" className="size-6" />
                <span>{t('blockMenu.fromCloud')}</span>
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={menuSubTriggerClass}>
            <Image size="sm" className="size-6" />
            <span>{t('blockMenu.image')}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className={menuContentClass}>
            <DropdownMenuItem className={menuItemClass} onSelect={() => pickFromComputer('image')}>
              <Laptop size="sm" className="size-6" />
              <span>{t('blockMenu.fromComputer')}</span>
            </DropdownMenuItem>
            {isTutor ? (
              <DropdownMenuItem className={menuItemClass} onSelect={pickFromCloud}>
                <Materials size="sm" className="size-6" />
                <span>{t('blockMenu.fromCloud')}</span>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              className={menuItemClass}
              onSelect={() => openModal('insertImageLink')}
            >
              <LinkIcon size="sm" className="size-6" />
              <span>{t('blockMenu.fromLink')}</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem className={menuItemClass} onSelect={() => insertCode('')}>
          <Code size="sm" className="size-6" />
          <span>{t('blockMenu.insertCode')}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {BLOCK_OP_ACTIONS.map(({ key, labelKey, Icon, shortcut }) => {
          const handler = opHandlers[key];
          return (
            <DropdownMenuItem
              key={key}
              className={menuItemClass}
              onSelect={key === 'moveUp' || key === 'moveDown' ? deferAction(handler) : handler}
            >
              <Icon size="sm" className="size-6" />
              <span>{t(labelKey)}</span>
              <span className="text-xxs-base text-text-muted ml-auto">
                {isMac ? shortcut.mac : shortcut.other}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
