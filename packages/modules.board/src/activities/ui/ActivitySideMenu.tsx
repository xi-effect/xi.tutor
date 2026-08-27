import { track, useEditor } from '@ibodr/draw';
import { Button } from '@xipkg/button';
import { Checkbox } from '@xipkg/checkbox';
import { cn } from '@xipkg/utils';
import { useCurrentUser } from 'common.services';
import { useTranslation } from 'react-i18next';
import { boardMenuItemClass, boardMenuSurfaceClass } from '../../ui/boardTheme';
import { useYjsContext } from '../../providers/YjsProvider';
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

const itemClass = cn(
  boardMenuItemClass,
  'hover:bg-status-info-background focus-visible:bg-status-info-background flex h-8 w-full cursor-pointer items-center !justify-start rounded-lg border-0 bg-transparent px-3 text-left text-sm font-medium shadow-none appearance-none outline-none',
);

const checkboxRowClass = cn(
  boardMenuItemClass,
  'hover:bg-status-info-background flex h-8 w-full items-center !justify-start rounded-lg px-3 text-sm font-medium ring-0 ring-offset-0',
);

export const ActivitySideMenu = track(function ActivitySideMenu() {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const { isReadonly } = useYjsContext();
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const selectedShapes = editor.getSelectedShapes();
  const selectedActivity =
    selectedShapes.length === 1 &&
    selectedShapes[0].type === 'activity' &&
    !selectedShapes[0].isLocked
      ? (selectedShapes[0] as ActivityShape)
      : null;
  const editingIds = useActivityEditStore((state) => state.editingIds);
  const allEditing = Boolean(selectedActivity && editingIds[selectedActivity.id]);

  const selectedIds = editor.getSelectedShapeIds();
  const isSelect = editor.isIn('select');
  const isBrushing = editor.isIn('select.brushing');
  const screenBounds = editor.getSelectionRotatedScreenBounds();

  if (!selectedActivity) return null;
  if (!isSelect || isBrushing || !screenBounds || selectedIds.length !== 1) return null;

  const canEdit = Boolean(isTutor && !isReadonly);
  const shapes = [selectedActivity];
  const actions = getActivityMenuActions({
    t: (key) => t(key),
    shapes,
    canEdit,
    isTutor,
    allEditing,
  });
  const kindSettings = canEdit ? getActivityKindSettings(shapes) : [];
  const accessItems = canEdit ? studentAccessItems(shapes) : [];
  if (actions.length === 0 && kindSettings.length === 0 && accessItems.length === 0) return null;

  const container = editor.getContainer();
  const rect = container.getBoundingClientRect();
  const localX = screenBounds.x - rect.left;
  const localY = screenBounds.y - rect.top;
  const panelMinWidth = 200;
  const gap = 8;
  const rightX = localX + screenBounds.width + gap;
  const placeLeft = rightX + panelMinWidth > rect.width - 12;
  const left = placeLeft ? localX - gap : rightX;

  return (
    <div
      data-board-control=""
      className={cn(
        boardMenuSurfaceClass,
        'bg-background-surface pointer-events-auto absolute z-30 flex min-w-52 flex-col rounded-xl p-1 shadow-md',
      )}
      style={{
        left,
        top: localY,
        transform: placeLeft ? 'translateX(-100%)' : undefined,
        transition: 'left 60ms linear, top 60ms linear',
      }}
      onPointerDown={(event) => {
        editor.markEventAsHandled(event);
        event.stopPropagation();
      }}
    >
      {actions.map((action) => (
        <Button
          key={action.id}
          type="button"
          variant="none"
          size="s"
          className={itemClass}
          onClick={() => runActivityMenuAction(editor, shapes, action.id)}
        >
          {action.label}
        </Button>
      ))}
      {(kindSettings.length > 0 || accessItems.length > 0) && (
        <div className="border-border-default mx-1 my-1 border-t" />
      )}
      {kindSettings.map((setting) => (
        <Checkbox
          key={setting.id}
          size="s"
          checked={setting.mixed ? 'indeterminate' : setting.checked}
          onCheckedChange={() => setting.apply(editor, shapes)}
          className={checkboxRowClass}
        >
          {t(setting.labelKey)}
        </Checkbox>
      ))}
      {accessItems.length > 0 && (
        <>
          {kindSettings.length > 0 && <div className="border-border-default mx-1 my-1 border-t" />}
          <p className="text-text-secondary px-3 pt-1.5 pb-1 text-xs">
            {t('activity.studentSection')}
          </p>
          {accessItems.map((item) => (
            <Checkbox
              key={item.key}
              size="s"
              checked={item.mixed ? 'indeterminate' : item.checked}
              onCheckedChange={() => toggleStudentAccess(editor, shapes, item.key)}
              className={checkboxRowClass}
            >
              {t(STUDENT_ACCESS_LABEL_KEYS[item.key])}
            </Checkbox>
          ))}
        </>
      )}
    </div>
  );
});
