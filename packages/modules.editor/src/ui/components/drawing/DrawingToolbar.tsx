import { Button } from '@xipkg/button';
import { cn } from '@xipkg/utils';
import { Undo, Eraser, Trash, Close } from '@xipkg/icons'; // подставить реально существующие
import { DrawToolT } from '../../../types';

const COLORS = ['#1A1A1A', '#E53935', '#1E88E5', '#43A047'];
const SIZES = [0.006, 0.012, 0.02]; // тонкая / средняя / жирная, доля от ширины

type DrawingToolbarPropsT = {
  tool: DrawToolT;
  onToolChange: (tool: DrawToolT) => void;
  onUndo: () => void;
  onClear: () => void;
  onClose: () => void;
  canUndo: boolean;
};

export const DrawingToolbar = ({
  tool,
  onToolChange,
  onUndo,
  onClear,
  onClose,
  canUndo,
}: DrawingToolbarPropsT) => {
  return (
    <div className="bg-background-surface border-border-default absolute top-2 left-2 z-10 flex items-center gap-1 rounded-lg border p-1 px-2 shadow-md">
      {COLORS.map((color) => (
        <Button
          key={color}
          onClick={() => onToolChange({ ...tool, color, mode: 'draw' })}
          className={cn(
            'size-5 rounded-full border border-black/10 px-1',
            tool.mode === 'draw' &&
              tool.color === color &&
              'ring-border-selected ring-2 ring-offset-1',
          )}
          style={{ backgroundColor: color }}
        ></Button>
      ))}

      <div className="bg-border-default mx-1 h-4 w-px" />

      {SIZES.map((size) => (
        <Button
          variant={tool.size === size && tool.mode === 'draw' ? 'default' : 'none'}
          size="s"
          className={cn('flex size-6 items-center justify-center rounded px-1')}
          onClick={() => onToolChange({ ...tool, size, mode: 'draw' })}
          key={size}
        >
          <span
            className="bg-icon-primary rounded-full"
            style={{ width: 4 + SIZES.indexOf(size) * 3, height: 4 + SIZES.indexOf(size) * 3 }}
          />
        </Button>
      ))}

      <div className="bg-border-default mx-1 h-4 w-px" />

      <Button
        variant={tool.mode === 'erase' ? 'default' : 'none'}
        size="s"
        className="rounded px-1"
        onClick={() => onToolChange({ ...tool, mode: 'erase' })}
      >
        <Eraser size="sm" className="size-5" />
      </Button>

      <Button variant="none" size="s" className="rounded px-1" disabled={!canUndo} onClick={onUndo}>
        <Undo size="sm" className="size-5" />
      </Button>

      <Button variant="none" size="s" className="rounded px-1" onClick={onClear}>
        <Trash size="sm" className="size-5" />
      </Button>

      <Button variant="none" size="s" className="rounded px-1" onClick={onClose}>
        <Close size="sm" className="size-5" />
      </Button>
    </div>
  );
};
