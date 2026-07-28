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
import { MenuDots, Link } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useEditor } from '@ibodr/draw';
import {
  boardIconClass,
  boardMenuItemClass,
  boardMenuSubTriggerClass,
  boardMenuSurfaceClass,
} from '../../boardTheme';
import { useCurrentUser } from 'common.services';
import { useCopyBoardDeepLink } from '../../../hooks';
import type { PdfShape } from '../../../shapes/pdf';
import type { AudioShape } from '../../../shapes/audio';
import { isMac } from '../../../utils';
import { useTranslation } from 'react-i18next';

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

  const hasTutorItems = isTutor && (!!selectedPdf || !!selectedAudio);

  if (selectedIds.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="none" size="s" className="hover:bg-status-info-background p-1">
          <MenuDots className={`rotate-90 ${boardIconClass}`} />
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
