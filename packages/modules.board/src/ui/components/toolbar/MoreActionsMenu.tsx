import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { MenuDots } from '@xipkg/icons';
import { useEditor } from 'tldraw';
import { useCurrentUser } from 'common.services';
import type { EmbedShape } from '../../../shapes/embed';
import type { PdfShape } from '../../../shapes/pdf';
import type { AudioShape } from '../../../shapes/audio';

export const MoreActionsMenu = () => {
  const editor = useEditor();
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const selectedShapes = editor.getSelectedShapes();
  const selectedPdf =
    selectedShapes.length === 1 && selectedShapes[0].type === 'pdf'
      ? (selectedShapes[0] as PdfShape)
      : null;
  const selectedEmbed =
    selectedShapes.length === 1 && selectedShapes[0].type === 'embedUrl'
      ? (selectedShapes[0] as EmbedShape)
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
      props: { syncPlayback: !selectedAudio.props.syncPlayback },
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
        <DropdownMenuItem
          onClick={() => {
            const selectedIds = editor.getSelectedShapeIds();
            editor.toggleLock(selectedIds);
          }}
          className="rounded-lg px-3"
        >
          Заблокировать
        </DropdownMenuItem>
        {isTutor && selectedPdf && (
          <DropdownMenuItem onClick={handleToggleStudentFlip} className="rounded-lg px-3">
            {selectedPdf.props.studentCanFlip ? 'Ограничить листание' : 'Разрешить листание'}
          </DropdownMenuItem>
        )}
        {selectedEmbed && selectedEmbed.props.url && (
          <DropdownMenuItem
            onClick={() => window.open(selectedEmbed.props.url, '_blank', 'noopener,noreferrer')}
            className="rounded-lg px-3"
          >
            Открыть в новой вкладке
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
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
