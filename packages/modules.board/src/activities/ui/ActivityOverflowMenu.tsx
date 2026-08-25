import { DropdownMenuCheckboxItem, DropdownMenuItem, DropdownMenuSeparator } from '@xipkg/dropdown';
import { cn } from '@xipkg/utils';
import { useEditor } from '@ibodr/draw';
import { useTranslation } from 'react-i18next';
import { boardMenuCheckboxItemClass, boardMenuItemClass } from '../../ui/boardTheme';
import type { ActivityShape } from '../shape/ActivityShape';
import { useActivityEditStore } from '../store/activityEditStore';
import {
  getActivityKindSettings,
  getActivityMenuActions,
  runActivityMenuAction,
  studentAccessItems,
  STUDENT_ACCESS_LABEL_KEYS,
  toggleStudentAccess,
} from './activityMenuActions';

export function ActivityActionMenuItems({
  shapes,
  canEdit,
  isTutor,
  onSelect,
}: {
  shapes: ActivityShape[];
  canEdit: boolean;
  isTutor: boolean;
  onSelect?: () => void;
}) {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const editingIds = useActivityEditStore((state) => state.editingIds);
  const allEditing = shapes.length > 0 && shapes.every((shape) => Boolean(editingIds[shape.id]));
  const actions = getActivityMenuActions({
    t: (key) => t(key),
    shapes,
    canEdit,
    isTutor,
    allEditing,
  });
  const kindSettings = isTutor ? getActivityKindSettings(shapes) : [];
  const accessItems = isTutor ? studentAccessItems(shapes) : [];

  if (shapes.length === 0) return null;

  return (
    <>
      {shapes.length > 1 && (
        <p className="text-text-secondary max-w-64 px-3 py-1.5 text-xs leading-snug">
          {t('activity.batchHint', { count: shapes.length })}
        </p>
      )}
      {actions.map((action) => (
        <DropdownMenuItem
          key={action.id}
          className={cn(boardMenuItemClass, 'rounded-lg px-3')}
          onClick={() => {
            runActivityMenuAction(editor, shapes, action.id);
            onSelect?.();
          }}
        >
          {action.label}
        </DropdownMenuItem>
      ))}
      {kindSettings.length > 0 && (
        <>
          <DropdownMenuSeparator />
          {kindSettings.map((setting) => (
            <DropdownMenuCheckboxItem
              key={setting.id}
              checked={setting.mixed ? 'indeterminate' : setting.checked}
              onCheckedChange={() => setting.apply(editor, shapes)}
              onSelect={(event) => event.preventDefault()}
              className={cn(boardMenuCheckboxItemClass, 'rounded-lg py-1.5 pr-3 pl-8')}
            >
              {t(setting.labelKey)}
            </DropdownMenuCheckboxItem>
          ))}
        </>
      )}
      {accessItems.length > 0 && (
        <>
          <DropdownMenuSeparator />
          <p className="text-text-secondary px-3 py-1 text-xs">{t('activity.studentSection')}</p>
          {accessItems.map((item) => (
            <DropdownMenuCheckboxItem
              key={item.key}
              checked={item.mixed ? 'indeterminate' : item.checked}
              onCheckedChange={() => toggleStudentAccess(editor, shapes, item.key)}
              onSelect={(event) => event.preventDefault()}
              className={cn(boardMenuCheckboxItemClass, 'rounded-lg py-1.5 pr-3 pl-8')}
            >
              {t(STUDENT_ACCESS_LABEL_KEYS[item.key])}
            </DropdownMenuCheckboxItem>
          ))}
        </>
      )}
    </>
  );
}
