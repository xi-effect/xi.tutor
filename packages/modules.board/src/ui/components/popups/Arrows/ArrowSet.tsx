import {
  useEditor,
  useValue,
  ArrowShapeArrowheadStartStyle,
  ArrowShapeArrowheadEndStyle,
  DefaultDashStyle,
} from '@ibodr/draw';
import { arrowVariants } from './arrowVariants';
import { ArrowTypeT } from './types';
import { cn } from '@xipkg/utils';
import { LineStylePicker } from './LineStylePicker';
import { applyArrowLineStyle, isLineStyleId, type LineStyleId } from './lineStyle';

export const ArrowSet = ({ className }: { className?: string }) => {
  const editor = useEditor();
  const start = useValue(
    'arrow-head-start',
    () => editor.getStyleForNextShape(ArrowShapeArrowheadStartStyle),
    [editor],
  );
  const end = useValue(
    'arrow-head-end',
    () => editor.getStyleForNextShape(ArrowShapeArrowheadEndStyle),
    [editor],
  );
  const dash = useValue('arrow-dash', () => editor.getStyleForNextShape(DefaultDashStyle), [
    editor,
  ]);

  const isPlainLine = start === 'none' && end === 'none';

  const handleShapeClick = (item: ArrowTypeT) => {
    editor.run(() => {
      editor.setCurrentTool('arrow');
      editor.setStyleForNextShapes(ArrowShapeArrowheadStartStyle, item.start);
      editor.setStyleForNextShapes(ArrowShapeArrowheadEndStyle, item.end);

      const nextIsArrow = item.start !== 'none' || item.end !== 'none';
      if (nextIsArrow && String(editor.getStyleForNextShape(DefaultDashStyle)) === 'double') {
        applyArrowLineStyle(editor, 'solid');
      }
    });
  };

  const handleLineStyle = (style: LineStyleId) => {
    editor.setCurrentTool('arrow');
    applyArrowLineStyle(editor, style);
  };

  return (
    <div
      className={cn(
        'border-border-default bg-background-surface flex w-full flex-wrap items-center gap-2 rounded-xl border p-1 shadow-none',
        className,
      )}
    >
      {arrowVariants.map((item) => {
        const isActive = item.start === start && item.end === end;
        return (
          <div
            key={item.name}
            className={cn(
              'flex rounded-lg border p-1',
              isActive ? 'border-border-focus' : 'border-transparent',
            )}
          >
            <button
              type="button"
              className="bg-transparent text-left"
              onClick={() => handleShapeClick(item)}
            >
              {item.icon}
            </button>
          </div>
        );
      })}
      <LineStylePicker
        value={isLineStyleId(dash) ? dash : null}
        allowDouble={isPlainLine}
        onChange={handleLineStyle}
      />
    </div>
  );
};
