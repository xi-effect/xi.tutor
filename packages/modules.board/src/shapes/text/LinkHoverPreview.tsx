import { useEditor } from '@ibodr/draw';
import { cn } from '@xipkg/utils';
import { boardMenuSurfaceClass } from '../../ui/boardTheme';
import { LINK_HOVER_PREVIEW_ATTR, useLinkHoverPreview } from './hooks';

/** Насколько превью заходит на нижний край наведённого текста. */
const TEXT_OVERLAP_PX = 2;

export const LinkHoverPreview = () => {
  const editor = useEditor();
  const hover = useLinkHoverPreview(editor);

  if (!hover) return null;

  const rect = editor.getContainer().getBoundingClientRect();
  const position = {
    left: hover.x - rect.left,
    top: hover.y - rect.top - TEXT_OVERLAP_PX,
  };

  return (
    <div
      {...{ [LINK_HOVER_PREVIEW_ATTR]: '' }}
      className="pointer-events-none absolute z-30 max-w-[320px]"
      style={{
        left: position.left,
        top: position.top,
        transform: `translateX(-50%) scale(${hover.scale})`,
        transformOrigin: 'top center',
      }}
    >
      <a
        href={hover.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          boardMenuSurfaceClass,
          'text-brand-80 pointer-events-auto block truncate rounded-lg p-2 text-xs underline shadow-md',
        )}
      >
        {hover.href}
      </a>
    </div>
  );
};
