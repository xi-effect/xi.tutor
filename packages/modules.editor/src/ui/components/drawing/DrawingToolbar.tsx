import { useEffect, useRef, useState } from 'react';
import { Button } from '@xipkg/button';
import { cn } from '@xipkg/utils';
import { Undo, Eraser, Trash, Close } from '@xipkg/icons';
import { DrawToolT } from '../../../types';
import { DropdownMenuSeparator } from '@xipkg/dropdown';
import { Slider } from '@xipkg/slider';

const COLORS = ['#1A1A1A', '#E53935', '#1E88E5', '#43A047'];
const SIZES = [0.006, 0.012, 0.02];

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
  const [isOpacityOpen, setIsOpacityOpen] = useState(false);
  const opacityRef = useRef<HTMLDivElement>(null);
  const opacityPercent = Math.round((tool.opacity ?? 1) * 100);

  useEffect(() => {
    if (!isOpacityOpen) return;

    const handlePointerDownOutside = (e: PointerEvent) => {
      if (opacityRef.current && !opacityRef.current.contains(e.target as Node)) {
        setIsOpacityOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDownOutside, true);
    return () => document.removeEventListener('pointerdown', handlePointerDownOutside, true);
  }, [isOpacityOpen]);

  return (
    <div className="bg-background-surface border-border-default absolute -right-10 bottom-0 z-10 flex flex-col items-center gap-1 rounded-lg border p-1 py-2 shadow-md">
      <div className="pointer-events-auto relative" ref={opacityRef}>
        <Button
          variant="none"
          size="s"
          className="rounded px-1"
          onClick={() => setIsOpacityOpen((prev) => !prev)}
        >
          <span
            className="border-border-default relative block size-5 overflow-hidden rounded-sm border"
            style={{
              backgroundImage:
                'linear-gradient(45deg, #9CA3AF 25%, transparent 25%), linear-gradient(-45deg, #9CA3AF 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #9CA3AF 75%), linear-gradient(-45deg, transparent 75%, #9CA3AF 75%)',
              backgroundSize: '6px 6px',
              backgroundPosition: '0 0, 0 3px, 3px -3px, -3px 0px',
            }}
          >
            <span
              className="absolute inset-0"
              style={{ backgroundColor: tool.color, opacity: tool.opacity ?? 1 }}
            />
          </span>
        </Button>

        {isOpacityOpen && (
          <div className="bg-background-surface border-border-default absolute top-1/2 right-full mr-2 flex -translate-y-1/2 items-center gap-2 rounded-lg border p-2 shadow-md">
            <Slider
              onValueChange={(e) => onToolChange({ ...tool, opacity: Number(e[0]) / 100 })}
              value={[opacityPercent]}
              min={10}
              max={100}
              step={10}
              className="h-1 w-26 accent-current"
            />
            <span className="text-text-primary w-10 shrink-0 text-xs tabular-nums">
              {opacityPercent}%
            </span>
          </div>
        )}
      </div>

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

      <DropdownMenuSeparator className="m-0 w-full" />

      {SIZES.map((size) => (
        <Button
          variant={tool.size === size ? 'default' : 'none'}
          size="s"
          className={cn('flex size-6 items-center justify-center rounded px-1')}
          onClick={() => onToolChange({ ...tool, size })}
          key={size}
        >
          <span
            className="bg-icon-primary rounded-full"
            style={{ width: 4 + SIZES.indexOf(size) * 3, height: 4 + SIZES.indexOf(size) * 3 }}
          />
        </Button>
      ))}

      <DropdownMenuSeparator className="m-0 w-full" />

      <Button
        variant={tool.mode === 'erase' ? 'default' : 'none'}
        size="s"
        className="rounded px-1"
        onClick={() => onToolChange({ ...tool, mode: 'erase' })}
      >
        <Eraser size="sm" className="size-5" />
      </Button>

      <Button variant="none" size="s" className="rounded px-1" disabled={!canUndo} onClick={onUndo}>
        <Undo size="sm" className="size-5 text-inherit" />
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
