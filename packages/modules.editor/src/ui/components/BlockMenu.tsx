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
import {
  Copy,
  H1,
  H2,
  H3,
  Text,
  Trash,
  Laptop,
  Materials,
  Link as LinkIcon,
  ArrowUp,
  ArrowBottom,
  Code,
  Ul,
  Ol,
  Task,
  File,
  Image,
} from '@xipkg/icons';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@xipkg/utils';
import { useCurrentUser } from 'common.services';
import { useBlockMenuActions, useYjsContext } from '../../hooks';
import { Editor } from '@tiptap/core';
import { useInterfaceStore } from '../../store/interfaceStore';
import { ActiveBlockT } from '../../types';
import { pickAndInsertComputerFiles } from '../../utils/pickAndInsertComputerFiles';

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
  const { openModal, openCloudPicker } = useInterfaceStore();
  const { storageItem } = useYjsContext();
  const { insertBlock, duplicate, remove, moveUp, moveDown, insertCode } = useBlockMenuActions(
    editor,
    getActiveBlock,
  );

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

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="start"
        onCloseAutoFocus={(e) => e.preventDefault()}
        className={menuContentClass}
      >
        <DropdownMenuItem className={menuItemClass} onSelect={() => insertBlock('paragraph')}>
          <Text size="sm" className="size-6" />
          <span>{t('blockMenu.text')}</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemClass} onSelect={() => insertBlock('heading1')}>
          <H1 size="sm" className="size-6" />
          <span>{t('blockMenu.heading1')}</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemClass} onSelect={() => insertBlock('heading2')}>
          <H2 size="sm" className="size-6" />
          <span>{t('blockMenu.heading2')}</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemClass} onSelect={() => insertBlock('heading3')}>
          <H3 size="sm" className="size-6" />
          <span>{t('blockMenu.heading3')}</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemClass} onSelect={() => insertBlock('bulletList')}>
          <Ul size="sm" className="size-6" />
          <span>{t('blockMenu.bulletList')}</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemClass} onSelect={() => insertBlock('orderedList')}>
          <Ol size="sm" className="size-6" />
          <span>{t('blockMenu.orderedList')}</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemClass} onSelect={() => insertBlock('taskList')}>
          <Task size="sm" className="size-6" />
          <span>{t('blockMenu.taskList')}</span>
        </DropdownMenuItem>

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

        <DropdownMenuItem className={menuItemClass} onSelect={duplicate}>
          <Copy size="sm" className="size-6" />
          <span className="text-sm">{t('blockMenu.duplicate')}</span>
          <span className="text-xxs-base text-text-muted ml-auto">
            {isMac ? '⌘+⇧+C' : 'Ctrl+Shift+C'}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="hover:bg-background-page h-7 gap-2 rounded p-1"
          onSelect={deferAction(moveUp)}
        >
          <ArrowUp size="sm" className="size-6" />
          <span className="text-sm">{t('blockMenu.moveUp')}</span>
          <span className="text-xxs-base text-text-muted ml-auto">
            {isMac ? '⌘+⇧+↑' : 'Ctrl+Shift+↑'}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="hover:bg-background-page h-7 gap-2 rounded p-1"
          onSelect={deferAction(moveDown)}
        >
          <ArrowBottom size="sm" className="size-6" />
          <span className="text-sm">{t('blockMenu.moveDown')}</span>
          <span className="text-xxs-base text-text-muted ml-auto">
            {isMac ? '⌘+⇧+↓' : 'Ctrl+Shift+↓'}
          </span>
        </DropdownMenuItem>

        <DropdownMenuItem className={menuItemClass} onSelect={remove}>
          <Trash size="sm" className="size-6" />
          <span className="text-sm">{t('blockMenu.delete')}</span>
          <span className="text-xxs-base text-text-muted ml-auto">{isMac ? '⌘+⌫' : 'Del'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
