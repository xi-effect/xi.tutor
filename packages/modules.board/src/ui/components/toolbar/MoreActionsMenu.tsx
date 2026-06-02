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
import { MenuDots } from '@xipkg/icons';
import { useEditor } from '@ibodr/draw';
import { useCurrentUser } from 'common.services';
import type { PdfShape } from '../../../shapes/pdf';
import type { AudioShape } from '../../../shapes/audio';
import { isMac } from '../../../utils';

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
    <DropdownMenuItem onClick={onClick} className="flex justify-between gap-8 rounded-lg px-3">
      <span>{label}</span>
      <span className="text-gray-60 text-xs">{shortcut}</span>
    </DropdownMenuItem>
  );
}

export const MoreActionsMenu = () => {
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
        <Button variant="none" size="s" className="hover:bg-brand-0 p-1">
          <MenuDots className="rotate-90" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="end"
        sideOffset={8}
        className="border-gray-10 bg-gray-0 flex w-auto flex-col gap-1 rounded-xl border p-1"
      >
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="rounded-lg px-3">
            Переупорядочить
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent
            sideOffset={12}
            alignOffset={-4}
            className="border-gray-10 bg-gray-0 flex w-auto min-w-[220px] flex-col gap-1 rounded-xl border p-1"
          >
            <MenuItemWithShortcut
              label="На передний план"
              shortcut="]"
              onClick={() => editor.bringToFront(selectedIds)}
            />
            <MenuItemWithShortcut
              label="Переместить вперед"
              shortcut={`${altKey} ]`}
              onClick={() => editor.bringForward(selectedIds)}
            />
            <MenuItemWithShortcut
              label="Переместить назад"
              shortcut={`${altKey} [`}
              onClick={() => editor.sendBackward(selectedIds)}
            />
            <MenuItemWithShortcut
              label="На задний план"
              shortcut="["
              onClick={() => editor.sendToBack(selectedIds)}
            />
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {hasTutorItems && (
          <>
            <DropdownMenuSeparator />
            {isTutor && selectedPdf && (
              <DropdownMenuItem onClick={handleToggleStudentFlip} className="rounded-lg px-3">
                {selectedPdf.props.studentCanFlip ? 'Ограничить листание' : 'Разрешить листание'}
              </DropdownMenuItem>
            )}
            {isTutor && selectedAudio && (
              <>
                <DropdownMenuItem onClick={handleToggleSyncPlayback} className="rounded-lg px-3">
                  {selectedAudio.props.syncPlayback
                    ? 'Локальное воспроизведение'
                    : 'Синхронное воспроизведение'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleToggleStudentsCanAddTimecodes}
                  className="rounded-lg px-3"
                >
                  {selectedAudio.props.studentsCanAddTimecodes
                    ? 'Запретить ученикам добавлять таймкоды'
                    : 'Разрешить ученикам добавлять таймкоды'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleToggleTimecodesVisibleByDefault}
                  className="rounded-lg px-3"
                >
                  {selectedAudio.props.timecodesVisibleByDefault
                    ? 'Скрывать новые таймкоды от учеников'
                    : 'Показывать новые таймкоды всем'}
                </DropdownMenuItem>
                {selectedAudio.props.syncPlayback && (
                  <DropdownMenuItem
                    onClick={handleToggleStudentsCanControlPlayback}
                    className="rounded-lg px-3"
                  >
                    {selectedAudio.props.studentsCanControlPlayback
                      ? 'Запретить управление'
                      : 'Разрешить управление'}
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
