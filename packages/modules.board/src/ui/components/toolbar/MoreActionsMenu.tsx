import { Button } from '@xipkg/button';
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
import { MenuDots, Link, ArrowRight } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { exportAs, useEditor } from '@ibodr/draw';
import {
  boardIconClass,
  boardMenuItemClass,
  boardMenuSubTriggerClass,
  boardMenuSurfaceClass,
  boardSelectionToolbarButtonClass,
} from '../../boardTheme';
import { useCurrentUser } from 'common.services';
import { useCopyBoardDeepLink } from '../../../hooks';
import type { PdfShape } from '../../../shapes/pdf';
import type { AudioShape } from '../../../shapes/audio';
import {
  ActivityActionMenuItems,
  getActivityKindSettings,
  getActivityMenuActions,
  runActivityMenuAction,
  selectedActivityShapes,
  studentAccessItems,
  STUDENT_ACCESS_LABEL_KEYS,
  toggleStudentAccess,
  useActivityEditStore,
} from '../../../activities';
import { isMac } from '../../../utils';
import { PNG_EXPORT_PIXEL_RATIO } from '../../../utils/shapeSvgExport';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useState } from 'react';
import { useOcrProcessingStore } from '../../../ocr';
import { BoardDrawer, boardDrawerRowClass, useBoardIsMobile } from '../shared';
import {
  RecognizePrintedTextMobileLanguageList,
  RecognizePrintedTextMobileRootRow,
  RecognizePrintedTextSubmenu,
} from './RecognizeTextMenu';

const altKey = isMac ? '⌥' : 'Alt';

function MenuItemWithShortcut({
  label,
  shortcut,
  onClick,
}: {
  label: string;
  shortcut: string;
  onClick: () => void;
}) {
  return (
    <DropdownMenuItem
      onClick={onClick}
      className={cn(boardMenuItemClass, 'flex justify-between gap-8 rounded-lg px-3')}
    >
      <span>{label}</span>
      <span className="text-text-secondary text-xs">{shortcut}</span>
    </DropdownMenuItem>
  );
}

export const MoreActionsMenu = () => {
  const { t } = useTranslation('board');
  const isMobile = useBoardIsMobile();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'root' | 'download' | 'reorder' | 'ocr'>('root');
  const editor = useEditor();
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const selectedIds = editor.getSelectedShapeIds();
  const selectedShapes = editor.getSelectedShapes();
  const selectedPdf =
    selectedShapes.length === 1 && selectedShapes[0].type === 'pdf'
      ? (selectedShapes[0] as PdfShape)
      : null;

  const selectedAudio =
    selectedShapes.length === 1 && selectedShapes[0].type === 'audio'
      ? (selectedShapes[0] as AudioShape)
      : null;

  const selectedActivities = selectedActivityShapes(selectedShapes);
  const editingIds = useActivityEditStore((state) => state.editingIds);
  const allActivitiesEditing =
    selectedActivities.length > 0 &&
    selectedActivities.every((shape) => Boolean(editingIds[shape.id]));
  const activityActions = getActivityMenuActions({
    t: (key) => t(key),
    shapes: selectedActivities,
    canEdit: isTutor,
    isTutor,
    allEditing: allActivitiesEditing,
  });
  const activityKindSettings = isTutor ? getActivityKindSettings(selectedActivities) : [];
  const activityAccessItems = isTutor ? studentAccessItems(selectedActivities) : [];

  const selectedImageId =
    selectedShapes.length === 1 && selectedShapes[0].type === 'image' && !selectedShapes[0].isLocked
      ? selectedShapes[0].id
      : null;
  const isOcrProcessing = useOcrProcessingStore((state) =>
    selectedImageId ? state.isProcessing(selectedImageId) : false,
  );

  const copyDeepLink = useCopyBoardDeepLink({ shapeIds: selectedIds.map(String) });

  const handleToggleStudentFlip = () => {
    if (!selectedPdf) return;
    editor.updateShape<PdfShape>({
      id: selectedPdf.id,
      type: 'pdf',
      props: { studentCanFlip: !selectedPdf.props.studentCanFlip },
    });
  };

  const handleToggleSyncPlayback = () => {
    if (!selectedAudio) return;
    editor.updateShape<AudioShape>({
      id: selectedAudio.id,
      type: 'audio',
      props: { syncPlayback: !selectedAudio.props.syncPlayback, studentsCanControlPlayback: false },
    });
  };

  const handleToggleStudentsCanAddTimecodes = () => {
    if (!selectedAudio) return;
    editor.updateShape<AudioShape>({
      id: selectedAudio.id,
      type: 'audio',
      props: { studentsCanAddTimecodes: !selectedAudio.props.studentsCanAddTimecodes },
    });
  };

  const handleToggleTimecodesVisibleByDefault = () => {
    if (!selectedAudio) return;
    editor.updateShape<AudioShape>({
      id: selectedAudio.id,
      type: 'audio',
      props: { timecodesVisibleByDefault: !selectedAudio.props.timecodesVisibleByDefault },
    });
  };

  const handleToggleStudentsCanControlPlayback = () => {
    if (!selectedAudio) return;
    editor.updateShape<AudioShape>({
      id: selectedAudio.id,
      type: 'audio',
      props: { studentsCanControlPlayback: !selectedAudio.props.studentsCanControlPlayback },
    });
  };

  const handleExportSelection = async (format: 'png' | 'svg') => {
    if (selectedIds.length === 0) return;

    try {
      await exportAs(editor, [...selectedIds], {
        format,
        background: true,
        padding: 16,
        ...(format === 'png' ? { scale: 1, pixelRatio: PNG_EXPORT_PIXEL_RATIO } : {}),
      });
      toast.success(t('toast.selectionExportSuccess'));
    } catch (error) {
      console.error('Ошибка при экспорте выделенных элементов:', error);
      toast.error(t('toast.selectionExportError'));
    }
  };

  const hasTutorItems = isTutor && (!!selectedPdf || !!selectedAudio);

  if (selectedIds.length === 0) return null;

  const trigger = (
    <Button
      variant="none"
      size="s"
      className={boardSelectionToolbarButtonClass}
      onClick={isMobile ? () => setOpen(true) : undefined}
    >
      <MenuDots className={`size-5 rotate-90 ${boardIconClass}`} />
    </Button>
  );

  if (isMobile) {
    const title =
      view === 'download'
        ? t('toolbar.downloadAs')
        : view === 'reorder'
          ? t('toolbar.reorder')
          : view === 'ocr'
            ? t('ocr.recognize')
            : t('navbar.more');

    return (
      <>
        {trigger}
        <BoardDrawer
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) setView('root');
          }}
          title={title}
          onBack={view === 'root' ? undefined : () => setView('root')}
        >
          {view === 'root' && (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className={boardDrawerRowClass}
                onClick={() => {
                  void copyDeepLink();
                  setOpen(false);
                }}
              >
                <Link className={`size-4 ${boardIconClass}`} />
                <span className="text-text-primary text-sm font-medium">
                  {t('toolbar.copyLink')}
                </span>
              </button>
              <button
                type="button"
                className={boardDrawerRowClass}
                onClick={() => setView('download')}
              >
                <span className="text-text-primary min-w-0 flex-1 text-sm font-medium">
                  {t('toolbar.downloadAs')}
                </span>
                <ArrowRight className="fill-icon-secondary size-4 shrink-0" />
              </button>
              <button
                type="button"
                className={boardDrawerRowClass}
                onClick={() => setView('reorder')}
              >
                <span className="text-text-primary min-w-0 flex-1 text-sm font-medium">
                  {t('toolbar.reorder')}
                </span>
                <ArrowRight className="fill-icon-secondary size-4 shrink-0" />
              </button>
              {selectedImageId && (
                <RecognizePrintedTextMobileRootRow
                  isProcessing={isOcrProcessing}
                  onOpen={() => setView('ocr')}
                />
              )}
              {selectedActivities.length > 1 && (
                <p className="text-text-secondary px-1 text-xs leading-snug">
                  {t('activity.batchHint', { count: selectedActivities.length })}
                </p>
              )}
              {activityActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className={boardDrawerRowClass}
                  onClick={() => {
                    runActivityMenuAction(editor, selectedActivities, action.id);
                    setOpen(false);
                  }}
                >
                  <span className="text-text-primary text-sm font-medium">{action.label}</span>
                </button>
              ))}
              {activityKindSettings.map((setting) => (
                <button
                  key={setting.id}
                  type="button"
                  className={boardDrawerRowClass}
                  onClick={() => setting.apply(editor, selectedActivities)}
                >
                  <span className="text-text-primary text-sm font-medium">
                    {setting.checked ? '✓ ' : ''}
                    {t(setting.labelKey)}
                  </span>
                </button>
              ))}
              {activityAccessItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={boardDrawerRowClass}
                  onClick={() => toggleStudentAccess(editor, selectedActivities, item.key)}
                >
                  <span className="text-text-primary text-sm font-medium">
                    {item.checked ? '✓ ' : ''}
                    {t(STUDENT_ACCESS_LABEL_KEYS[item.key])}
                  </span>
                </button>
              ))}
              {hasTutorItems && isTutor && selectedPdf && (
                <button
                  type="button"
                  className={boardDrawerRowClass}
                  onClick={handleToggleStudentFlip}
                >
                  <span className="text-text-primary text-sm font-medium">
                    {selectedPdf.props.studentCanFlip
                      ? t('toolbar.restrictFlip')
                      : t('toolbar.allowFlip')}
                  </span>
                </button>
              )}
              {hasTutorItems && isTutor && selectedAudio && (
                <>
                  <button
                    type="button"
                    className={boardDrawerRowClass}
                    onClick={handleToggleSyncPlayback}
                  >
                    <span className="text-text-primary text-sm font-medium">
                      {selectedAudio.props.syncPlayback
                        ? t('toolbar.localPlayback')
                        : t('toolbar.syncPlayback')}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={boardDrawerRowClass}
                    onClick={handleToggleStudentsCanAddTimecodes}
                  >
                    <span className="text-text-primary text-sm font-medium">
                      {selectedAudio.props.studentsCanAddTimecodes
                        ? t('toolbar.forbidStudentTimecodes')
                        : t('toolbar.allowStudentTimecodes')}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={boardDrawerRowClass}
                    onClick={handleToggleTimecodesVisibleByDefault}
                  >
                    <span className="text-text-primary text-sm font-medium">
                      {selectedAudio.props.timecodesVisibleByDefault
                        ? t('toolbar.hideNewTimecodes')
                        : t('toolbar.showNewTimecodes')}
                    </span>
                  </button>
                  {selectedAudio.props.syncPlayback && (
                    <button
                      type="button"
                      className={boardDrawerRowClass}
                      onClick={handleToggleStudentsCanControlPlayback}
                    >
                      <span className="text-text-primary text-sm font-medium">
                        {selectedAudio.props.studentsCanControlPlayback
                          ? t('toolbar.forbidControl')
                          : t('toolbar.allowControl')}
                      </span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
          {view === 'download' && (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className={boardDrawerRowClass}
                onClick={() => {
                  void handleExportSelection('png');
                  setOpen(false);
                }}
              >
                <span className="text-text-primary text-sm font-medium">
                  {t('toolbar.downloadPng')}
                </span>
              </button>
              <button
                type="button"
                className={boardDrawerRowClass}
                onClick={() => {
                  void handleExportSelection('svg');
                  setOpen(false);
                }}
              >
                <span className="text-text-primary text-sm font-medium">
                  {t('toolbar.downloadSvg')}
                </span>
              </button>
            </div>
          )}
          {view === 'reorder' && (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className={boardDrawerRowClass}
                onClick={() => {
                  editor.bringToFront(selectedIds);
                  setOpen(false);
                }}
              >
                <span className="text-text-primary text-sm font-medium">
                  {t('toolbar.bringToFront')}
                </span>
              </button>
              <button
                type="button"
                className={boardDrawerRowClass}
                onClick={() => {
                  editor.bringForward(selectedIds);
                  setOpen(false);
                }}
              >
                <span className="text-text-primary text-sm font-medium">
                  {t('toolbar.bringForward')}
                </span>
              </button>
              <button
                type="button"
                className={boardDrawerRowClass}
                onClick={() => {
                  editor.sendBackward(selectedIds);
                  setOpen(false);
                }}
              >
                <span className="text-text-primary text-sm font-medium">
                  {t('toolbar.sendBackward')}
                </span>
              </button>
              <button
                type="button"
                className={boardDrawerRowClass}
                onClick={() => {
                  editor.sendToBack(selectedIds);
                  setOpen(false);
                }}
              >
                <span className="text-text-primary text-sm font-medium">
                  {t('toolbar.sendToBack')}
                </span>
              </button>
            </div>
          )}
          {view === 'ocr' && selectedImageId && (
            <RecognizePrintedTextMobileLanguageList
              shapeId={selectedImageId}
              onRun={() => setOpen(false)}
            />
          )}
        </BoardDrawer>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="none" size="s" className={boardSelectionToolbarButtonClass}>
          <MenuDots className={`size-5 rotate-90 ${boardIconClass}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="end"
        sideOffset={8}
        className={cn(boardMenuSurfaceClass, 'flex w-auto flex-col gap-1 rounded-xl p-1')}
      >
        <DropdownMenuItem
          onClick={() => void copyDeepLink()}
          className={cn(boardMenuItemClass, 'rounded-lg px-3')}
          data-umami-event="board-copy-shape-link"
        >
          <Link className={`mr-2 size-4 ${boardIconClass}`} />
          {t('toolbar.copyLink')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={cn(boardMenuSubTriggerClass, 'rounded-lg px-3')}>
            {t('toolbar.downloadAs')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent
            sideOffset={12}
            alignOffset={-4}
            className={cn(
              boardMenuSurfaceClass,
              'flex w-auto min-w-40 flex-col gap-1 rounded-xl p-1',
            )}
          >
            <DropdownMenuItem
              onClick={() => void handleExportSelection('png')}
              className={cn(boardMenuItemClass, 'rounded-lg px-3')}
              data-umami-event="board-export-selection"
              data-umami-event-format="png"
            >
              {t('toolbar.downloadPng')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => void handleExportSelection('svg')}
              className={cn(boardMenuItemClass, 'rounded-lg px-3')}
              data-umami-event="board-export-selection"
              data-umami-event-format="svg"
            >
              {t('toolbar.downloadSvg')}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={cn(boardMenuSubTriggerClass, 'rounded-lg px-3')}>
            {t('toolbar.reorder')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent
            sideOffset={12}
            alignOffset={-4}
            className={cn(
              boardMenuSurfaceClass,
              'flex w-auto min-w-[220px] flex-col gap-1 rounded-xl p-1',
            )}
          >
            <MenuItemWithShortcut
              label={t('toolbar.bringToFront')}
              shortcut="]"
              onClick={() => editor.bringToFront(selectedIds)}
            />
            <MenuItemWithShortcut
              label={t('toolbar.bringForward')}
              shortcut={`${altKey} ]`}
              onClick={() => editor.bringForward(selectedIds)}
            />
            <MenuItemWithShortcut
              label={t('toolbar.sendBackward')}
              shortcut={`${altKey} [`}
              onClick={() => editor.sendBackward(selectedIds)}
            />
            <MenuItemWithShortcut
              label={t('toolbar.sendToBack')}
              shortcut="["
              onClick={() => editor.sendToBack(selectedIds)}
            />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        {selectedImageId && <RecognizePrintedTextSubmenu shapeId={selectedImageId} />}

        {selectedActivities.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <ActivityActionMenuItems
              shapes={selectedActivities}
              canEdit={isTutor}
              isTutor={isTutor}
            />
          </>
        )}

        {hasTutorItems && (
          <>
            <DropdownMenuSeparator />
            {isTutor && selectedPdf && (
              <DropdownMenuItem
                onClick={handleToggleStudentFlip}
                className={cn(boardMenuItemClass, 'rounded-lg px-3')}
              >
                {selectedPdf.props.studentCanFlip
                  ? t('toolbar.restrictFlip')
                  : t('toolbar.allowFlip')}
              </DropdownMenuItem>
            )}
            {isTutor && selectedAudio && (
              <>
                <DropdownMenuItem
                  onClick={handleToggleSyncPlayback}
                  className={cn(boardMenuItemClass, 'rounded-lg px-3')}
                >
                  {selectedAudio.props.syncPlayback
                    ? t('toolbar.localPlayback')
                    : t('toolbar.syncPlayback')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleToggleStudentsCanAddTimecodes}
                  className={cn(boardMenuItemClass, 'rounded-lg px-3')}
                >
                  {selectedAudio.props.studentsCanAddTimecodes
                    ? t('toolbar.forbidStudentTimecodes')
                    : t('toolbar.allowStudentTimecodes')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleToggleTimecodesVisibleByDefault}
                  className={cn(boardMenuItemClass, 'rounded-lg px-3')}
                >
                  {selectedAudio.props.timecodesVisibleByDefault
                    ? t('toolbar.hideNewTimecodes')
                    : t('toolbar.showNewTimecodes')}
                </DropdownMenuItem>
                {selectedAudio.props.syncPlayback && (
                  <DropdownMenuItem
                    onClick={handleToggleStudentsCanControlPlayback}
                    className={cn(boardMenuItemClass, 'rounded-lg px-3')}
                  >
                    {selectedAudio.props.studentsCanControlPlayback
                      ? t('toolbar.forbidControl')
                      : t('toolbar.allowControl')}
                  </DropdownMenuItem>
                )}
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
