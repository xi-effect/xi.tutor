import { useMemo, useState } from 'react';
import { AccessModeT, MaterialActionsMenuPropsT } from 'common.types';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Button } from '@xipkg/button';
import { Copy, Edit, Eyeon, Flag, MoreVert, Trash } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import {
  cardMenuButtonClass,
  cardMenuCheckboxItemClass,
  cardMenuDeleteItemClass,
  cardMenuIconClass,
  cardMenuItemClass,
  cardMenuSeparatorClass,
  cardMenuSubTriggerClass,
  cardMenuSurfaceClass,
} from 'common.ui';
import { useTranslation } from 'react-i18next';

export const MaterialActionsMenu = ({
  isClassroom,
  isTutor,
  studentAccessMode,
  onDelete,
  onDeleteFromClassroom,
  onUpdateAccessMode,
  onDuplicate,
  onEditTags,
  setModalOpen,
}: MaterialActionsMenuPropsT) => {
  const { t } = useTranslation('materialsCard');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const options = useMemo(
    () =>
      (['read_only', 'no_access', 'read_write'] as AccessModeT[]).map((value) => ({
        value,
        label: t(`accessMode.${value}`),
      })),
    [t],
  );

  const handleAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen(false);

    action();
  };

  const handleChange = (key: AccessModeT) => {
    if (key !== studentAccessMode) {
      onUpdateAccessMode?.(key);
    }
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
          className={cardMenuButtonClass}
          variant="none"
          size="icon"
          data-umami-event="material-actions-menu-open"
        >
          <MoreVert className={cardMenuIconClass} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        className={cn(cardMenuSurfaceClass, 'text-text-primary')}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        {isClassroom && isTutor ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className={cardMenuSubTriggerClass}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
              data-umami-event="material-change-access-open"
            >
              <Eyeon />
              {t('menu.changeAccess')}
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent
              sideOffset={8}
              alignOffset={-4}
              className={cn(cardMenuSurfaceClass, 'text-text-primary')}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
              {options.map(({ value, label }) => (
                <DropdownMenuCheckboxItem
                  key={value}
                  checked={studentAccessMode === value}
                  onCheckedChange={() => handleChange(value)}
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                  className={cn(
                    cardMenuCheckboxItemClass,
                    studentAccessMode === value && 'bg-status-info-background text-text-link',
                  )}
                  data-umami-event="material-access-mode-change"
                  data-umami-event-mode={value}
                  data-umami-event-from={studentAccessMode}
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : (
          <DropdownMenuItem
            className={cardMenuItemClass}
            onClick={handleAction(onDuplicate)}
            data-umami-event="material-duplicate-to-classroom"
          >
            <Copy />
            {t('menu.duplicateToClassroom')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className={cardMenuItemClass}
          onClick={() => setModalOpen(true)}
          data-umami-event="material-edit"
        >
          <Edit />
          {t('menu.edit')}
        </DropdownMenuItem>
        {onEditTags ? (
          <DropdownMenuItem
            className={cardMenuItemClass}
            onClick={handleAction(onEditTags)}
            data-umami-event="material-edit-tags"
          >
            <Flag />
            {t('menu.editTags')}
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator className={cardMenuSeparatorClass} />
        <DropdownMenuItem
          error
          className={cardMenuDeleteItemClass}
          onClick={handleAction(isClassroom ? onDeleteFromClassroom : onDelete)}
          data-umami-event={isClassroom ? 'material-delete-from-classroom' : 'material-delete'}
        >
          <Trash />
          {t('menu.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
