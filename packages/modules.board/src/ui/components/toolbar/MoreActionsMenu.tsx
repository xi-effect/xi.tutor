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
import type { PdfShape } from '../../../shapes/pdf';

export const MoreActionsMenu = () => {
  const editor = useEditor();
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const selectedShapes = editor.getSelectedShapes();
  const selectedPdf =
    selectedShapes.length === 1 && selectedShapes[0].type === 'pdf'
      ? (selectedShapes[0] as PdfShape)
      : null;

  const handleToggleStudentFlip = () => {
    if (!selectedPdf) return;
    editor.updateShape<PdfShape>({
      id: selectedPdf.id,
      type: 'pdf',
      props: { studentCanFlip: !selectedPdf.props.studentCanFlip },
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
        className="border-gray-10 bg-gray-0 flex w-[220px] flex-col gap-1 rounded-xl border p-1"
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
