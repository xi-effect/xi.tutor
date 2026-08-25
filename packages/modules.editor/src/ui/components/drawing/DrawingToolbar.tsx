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
    <div className="bg-background-surface border-border-default absolute top-2 left-2 z-10 flex items-center gap-1 rounded-lg border p-1 shadow-md">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className={cn(
            'size-5 rounded-full border border-black/10',
            tool.mode === 'draw' && tool.color === color && 'ring-2 ring-offset-1',
          )}
          style={{ backgroundColor: color }}
          onClick={() => onToolChange({ ...tool, color, mode: 'draw' })}
        />
      ))}

      <div className="bg-border-default mx-1 h-4 w-px" />

      {SIZES.map((size) => (
        <button
          key={size}
          type="button"
          className={cn(
            'flex size-6 items-center justify-center rounded',
            tool.size === size && tool.mode === 'draw' && 'bg-background-page',
          )}
          onClick={() => onToolChange({ ...tool, size, mode: 'draw' })}
        >
          <span
            className="bg-icon-primary rounded-full"
            style={{ width: 4 + SIZES.indexOf(size) * 3, height: 4 + SIZES.indexOf(size) * 3 }}
          />
        </button>
      ))}

      <div className="bg-border-default mx-1 h-4 w-px" />

      <Button
        variant={tool.mode === 'erase' ? 'default' : 'none'}
        size="s"
        className="rounded px-1.5"
        onClick={() => onToolChange({ ...tool, mode: 'erase' })}
      >
        <Eraser size="sm" className="size-5" />
      </Button>

      <Button
        variant="none"
        size="s"
        className="rounded px-1.5"
        disabled={!canUndo}
        onClick={onUndo}
      >
        <Undo size="sm" className="size-5" />
      </Button>

      <Button variant="none" size="s" className="rounded px-1.5" onClick={onClear}>
        <Trash size="sm" className="size-5" />
      </Button>

      <Button variant="none" size="s" className="rounded px-1.5" onClick={onClose}>
        <Close size="sm" className="size-5" />
      </Button>
    </div>
  );
};
