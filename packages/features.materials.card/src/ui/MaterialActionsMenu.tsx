import { useMemo, useState } from 'react';
import { AccessModeT, MaterialActionsMenuPropsT } from 'common.types';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Button } from '@xipkg/button';
import { MoreVert } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

/** text-xs-base нельзя вместе с text-gray-* — twMerge снимает цвет текста */
const menuSurfaceClass = 'border-border-default bg-background-surface border';
const menuItemClass =
  'text-text-primary hover:bg-status-info-background hover:text-text-primary focus:text-text-primary h-8 items-center whitespace-nowrap rounded-lg px-2 py-0 text-sm leading-none';

/**
 * SubTrigger из @xipkg/dropdown сам рисует lucide ChevronRight (stroke).
 * Нельзя наследовать items-start / leading-snug — стрелка уезжает по вертикали.
 * Пиним chevron абсолютом по центру строки.
 */
const menuSubTriggerClass = cn(
  'relative flex h-8 items-center rounded-lg px-2 pr-8 text-sm leading-none text-text-primary',
  'hover:bg-status-info-background hover:text-text-primary focus:bg-status-info-background focus:text-text-primary data-[state=open]:bg-status-info-background data-[state=open]:text-text-link',
  '[&>svg:last-child]:pointer-events-none [&>svg:last-child]:absolute [&>svg:last-child]:top-1/2 [&>svg:last-child]:right-2',
  '[&>svg:last-child]:size-4 [&>svg:last-child]:!m-0 [&>svg:last-child]:-translate-y-1/2',
  '[&>svg:last-child]:!fill-none [&>svg:last-child]:shrink-0 [&>svg:last-child]:stroke-current',
);

export const MaterialActionsMenu = ({
  isClassroom,
  isTutor,
  studentAccessMode,
  onDelete,
  onDeleteFromClassroom,
  onUpdateAccessMode,
  onDuplicate,
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
          className="group-hover:bg-background-surface h-8 min-h-8 w-8 min-w-8 rounded-sm"
          variant="none"
          size="icon"
          data-umami-event="material-actions-menu-open"
        >
          <MoreVert className="fill-icon-primary h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        className={cn(
          menuSurfaceClass,
          'text-text-primary w-56 space-y-1 rounded-lg p-2 font-normal',
        )}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        {isClassroom && isTutor ? (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className={menuSubTriggerClass}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
              data-umami-event="material-change-access-open"
            >
              {t('menu.changeAccess')}
            </DropdownMenuSubTrigger>

            <DropdownMenuSubContent
              sideOffset={8}
              alignOffset={-4}
              className={cn(
                menuSurfaceClass,
                'text-text-primary space-y-1 rounded-lg p-2 font-normal',
              )}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
              {options.map(({ value, label }) => (
                <DropdownMenuCheckboxItem
                  key={value}
                  checked={studentAccessMode === value}
                  onCheckedChange={() => handleChange(value)}
                  onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                  className={cn(
                    'h-8 cursor-pointer items-center rounded-lg py-0 text-sm leading-none',
                    studentAccessMode === value
                      ? 'bg-status-info-background text-text-link'
                      : 'text-text-primary hover:text-text-primary focus:text-text-primary',
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
            className={menuItemClass}
            onClick={handleAction(onDuplicate)}
            data-umami-event="material-duplicate-to-classroom"
          >
            {t('menu.duplicateToClassroom')}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className={cn(menuItemClass, 'w-full')}
          onClick={() => setModalOpen(true)}
          data-umami-event="material-edit"
        >
          {t('menu.edit')}
        </DropdownMenuItem>

        <DropdownMenuItem
          className={cn(menuItemClass, 'w-full')}
          onClick={handleAction(isClassroom ? onDeleteFromClassroom : onDelete)}
          data-umami-event={isClassroom ? 'material-delete-from-classroom' : 'material-delete'}
        >
          {t('menu.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
