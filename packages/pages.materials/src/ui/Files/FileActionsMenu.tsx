import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Edit, Eyeon, Flag, Folder, Share, Trash, type IconProps } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import {
  cardMenuDeleteItemClass,
  cardMenuItemClass,
  cardMenuSeparatorClass,
  cardMenuSurfaceClass,
} from 'common.ui';

type IconComponent = (props: IconProps) => ReactNode;

type FileActionsMenuProps = {
  children: ReactNode;
  onPreview?: () => void;
  onRename?: () => void;
  onEditTags?: () => void;
  onShare?: () => void;
  onWhereUsed?: () => void;
  onDelete: () => void;
  modal?: boolean;
  contentClassName?: string;
  previewUmami?: string;
  renameUmami?: string;
  editTagsUmami?: string;
  shareUmami?: string;
  whereUsedUmami?: string;
  deleteUmami?: string;
};

export const FileActionsMenu = ({
  children,
  onPreview,
  onRename,
  onEditTags,
  onShare,
  onWhereUsed,
  onDelete,
  modal = false,
  contentClassName,
  previewUmami = 'materials-file-preview',
  renameUmami = 'materials-file-rename',
  editTagsUmami = 'materials-file-edit-tags',
  shareUmami = 'materials-file-share',
  whereUsedUmami = 'materials-file-where-used',
  deleteUmami = 'materials-file-delete',
}: FileActionsMenuProps) => {
  const { t } = useTranslation('materials');

  const handleOrSoon = (action?: () => void) => {
    if (action) {
      action();
      return;
    }

    toast(t('files.menu.soon'));
  };

  const items: Array<{
    key: string;
    label: string;
    icon: IconComponent;
    onSelect?: () => void;
    umami: string;
  }> = [
    ...(onPreview
      ? [
          {
            key: 'preview',
            label: t('files.menu.preview'),
            icon: Eyeon,
            onSelect: onPreview,
            umami: previewUmami,
          },
        ]
      : []),
    {
      key: 'rename',
      label: t('files.menu.rename'),
      icon: Edit,
      onSelect: onRename,
      umami: renameUmami,
    },
    {
      key: 'tags',
      label: t('files.menu.editTags'),
      icon: Flag,
      onSelect: onEditTags,
      umami: editTagsUmami,
    },
    {
      key: 'share',
      label: t('files.menu.share'),
      icon: Share,
      onSelect: onShare,
      umami: shareUmami,
    },
    {
      key: 'whereUsed',
      label: t('files.menu.whereUsed'),
      icon: Folder,
      onSelect: onWhereUsed,
      umami: whereUsedUmami,
    },
  ];

  return (
    <DropdownMenu modal={modal}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        className={cn(
          cardMenuSurfaceClass,
          'text-text-primary pointer-events-auto z-100',
          contentClassName,
        )}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {items.map(({ key, label, icon: Icon, onSelect, umami }) => (
          <DropdownMenuItem
            key={key}
            className={cardMenuItemClass}
            onClick={() => handleOrSoon(onSelect)}
            data-umami-event={umami}
          >
            <Icon />
            {label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className={cardMenuSeparatorClass} />
        <DropdownMenuItem
          error
          className={cardMenuDeleteItemClass}
          onClick={onDelete}
          data-umami-event={deleteUmami}
        >
          <Trash />
          {t('files.menu.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
