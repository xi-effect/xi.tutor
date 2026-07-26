import { useEditor } from '@ibodr/draw';
import { cn } from '@xipkg/utils';
import { boardMenuSurfaceClass } from '../../boardTheme';
import { useLinkHoverPreview } from '../../../hooks';

const CURSOR_VERTICAL_OFFSET = 16;

export const LinkHoverPreview = () => {
  const editor = useEditor();
  const hover = useLinkHoverPreview(editor);

  if (!hover) return null;

  const rect = editor.getContainer().getBoundingClientRect();

  return (
    <div
      className={cn(
        boardMenuSurfaceClass,
        'text-brand-80 pointer-events-auto absolute z-30 max-w-[320px] truncate rounded-xl px-4 py-2 text-xs underline shadow-md',
      )}
      style={{
        left: hover.x - rect.left,
        top: hover.y - rect.top + CURSOR_VERTICAL_OFFSET,
      }}
    >
      {hover.href}
    </div>
  );
};
