import { useEditorState, type Editor } from '@tiptap/react';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { MoreVert } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import {
  Activity,
  STUDENT_ACCESS_LABEL_KEYS,
  getActivityMenuActions,
  studentAccessItems,
  useActivityDocumentRole,
  useActivityEditStore,
  type ActivityStudentAccessKey,
} from 'modules.board/activities';
import { useTranslation } from 'react-i18next';
import { useYjsContext } from '../../hooks';
import {
  listNoteActivities,
  noteActivityShapes,
  runNoteActivityAction,
  setNoteStudentAccess,
} from '../../utils/noteActivities';

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

const menuPanelClass =
  'border-border-default bg-background-surface text-text-primary w-auto rounded-lg border p-2';

const menuStackClass = 'flex flex-col gap-1';

const checkboxItemClass =
  'text-text-primary hover:text-text-primary focus:text-text-primary rounded-lg py-1.5 pr-3 pl-8 [&_svg]:fill-none [&_svg]:stroke-current';

function NoteActivitiesMenuBody({ editor, isReadOnly }: { editor: Editor; isReadOnly: boolean }) {
  const { t } = useTranslation('editor');
  const { t: tBoard } = useTranslation('board');
  const { canEdit, isTutor } = useActivityDocumentRole(isReadOnly);
  const editingIds = useActivityEditStore((state) => state.editingIds);
  const activities = useEditorState({
    editor,
    selector: ({ editor: current }) => listNoteActivities(current),
  });
  const shapes = noteActivityShapes(activities);
  const allEditing =
    activities.length > 0 && activities.every((activity) => Boolean(editingIds[activity.value.id]));
  const actions = getActivityMenuActions({
    t: (key) => tBoard(key),
    shapes,
    canEdit,
    isTutor,
    allEditing,
  });
  const accessItems = canEdit ? studentAccessItems(shapes) : [];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="none" aria-label={t('noteMenu')} className="h-8 w-8 p-1">
          <MoreVert className="fill-icon-primary size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        className={cn(menuPanelClass, 'overflow-visible')}
      >
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={menuSubTriggerClass}>
            <Activity className="size-6" />
            <span>{t('blockMenu.exercise')}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent
              className={cn(menuPanelClass, menuStackClass, 'min-w-56 overflow-visible')}
            >
              <p className="text-text-secondary max-w-56 px-1 py-0.5 text-xs leading-snug">
                {t('noteActivitiesScope')}
              </p>
              {activities.length === 0 ? (
                <p className="text-text-muted max-w-56 px-1 py-0.5 text-xs leading-snug">
                  {t('noteActivitiesEmpty')}
                </p>
              ) : (
                <>
                  {actions.map((action) => (
                    <DropdownMenuItem
                      key={action.id}
                      className={menuItemClass}
                      onSelect={() => runNoteActivityAction(editor, action.id)}
                    >
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                  {accessItems.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <p className="text-text-secondary px-1 py-0.5 text-xs">
                        {tBoard('activity.studentSection')}
                      </p>
                      {accessItems.map((item) => (
                        <DropdownMenuCheckboxItem
                          key={item.key}
                          checked={item.mixed ? 'indeterminate' : item.checked}
                          onCheckedChange={(checked) =>
                            setNoteStudentAccess(
                              editor,
                              item.key as ActivityStudentAccessKey,
                              checked === true,
                            )
                          }
                          onSelect={(event) => event.preventDefault()}
                          className={checkboxItemClass}
                        >
                          {tBoard(STUDENT_ACCESS_LABEL_KEYS[item.key])}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </>
                  )}
                </>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NoteActivitiesMenu() {
  const { editor, isReadOnly } = useYjsContext();
  if (!editor) return null;
  return <NoteActivitiesMenuBody editor={editor} isReadOnly={isReadOnly} />;
}
