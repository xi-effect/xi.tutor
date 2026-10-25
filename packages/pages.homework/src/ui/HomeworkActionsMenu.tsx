import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Button } from '@xipkg/button';
import { Copy, Edit, Eyeon, FilePlus, Folder, MoreVert, Undo } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import {
  cardMaterialMenuButtonClass,
  cardMenuIconClass,
  cardMenuItemClass,
  cardMenuSeparatorClass,
  cardMenuSurfaceClass,
} from 'common.ui';
import type { HomeworkItem } from '../types';

type IconComponent = (props: { className?: string }) => ReactNode;

type HomeworkActionsMenuProps = {
  item: HomeworkItem;
  onOpen: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onCreateFromTemplate: () => void;
};

export const HomeworkActionsMenu = ({
  item,
  onOpen,
  onEdit,
  onDuplicate,
  onArchive,
  onRestore,
  onCreateFromTemplate,
}: HomeworkActionsMenuProps) => {
  const { t } = useTranslation('homework');
  const isArchive = item.feed === 'archive';
  const isTemplateFeed = item.kind === 'template' && item.feed === 'templates';

  const items: Array<{
    key: string;
    label: string;
    icon: IconComponent;
    onSelect: () => void;
    umami: string;
  }> = [
    {
      key: 'open',
      label: t('menu.open'),
      icon: Eyeon,
      onSelect: onOpen,
      umami: 'homework-open',
    },
  ];

  if (!isArchive) {
    items.push(
      {
        key: 'edit',
        label: t('menu.edit'),
        icon: Edit,
        onSelect: onEdit,
        umami: 'homework-edit',
      },
      {
        key: 'duplicate',
        label: t('menu.duplicate'),
        icon: Copy,
        onSelect: onDuplicate,
        umami: 'homework-duplicate',
      },
    );
  }

  if (isTemplateFeed) {
    items.push({
      key: 'create-from-template',
      label: t('menu.createFromTemplate'),
      icon: FilePlus,
      onSelect: onCreateFromTemplate,
      umami: 'homework-create-from-template',
    });
  }

  const trailing = isArchive
    ? {
        key: 'restore',
        label: t('menu.restore'),
        icon: Undo,
        onSelect: onRestore,
        umami: 'homework-restore',
      }
    : {
        key: 'archive',
        label: t('menu.archive'),
        icon: Folder,
        onSelect: onArchive,
        umami: 'homework-archive',
      };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="none"
          size="icon"
          className={cardMaterialMenuButtonClass}
          data-umami-event="homework-actions-menu-open"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreVert className={cardMenuIconClass} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        className={cn(cardMenuSurfaceClass, 'text-text-primary')}
        onClick={(event) => event.stopPropagation()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {items.map(({ key, label, icon: Icon, onSelect, umami }) => (
          <DropdownMenuItem
            key={key}
            className={cardMenuItemClass}
            onSelect={() => {
              window.setTimeout(onSelect, 0);
            }}
            data-umami-event={umami}
          >
            <Icon />
            {label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className={cardMenuSeparatorClass} />
        <DropdownMenuItem
          className={cardMenuItemClass}
          onSelect={() => {
            window.setTimeout(trailing.onSelect, 0);
          }}
          data-umami-event={trailing.umami}
        >
          <trailing.icon />
          {trailing.label}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
