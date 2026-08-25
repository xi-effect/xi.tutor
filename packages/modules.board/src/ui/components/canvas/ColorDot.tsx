import { cn } from '@xipkg/utils';

type ColorDotProps = {
  colorClass: string;
  colorCss?: string;
  isSelected: boolean;
  onClick: () => void;
};

export const ColorDot = ({ colorClass, colorCss, isSelected, onClick }: ColorDotProps) => (
  <button
    type="button"
    data-board-control=""
    onPointerDown={(event) => event.stopPropagation()}
    onClick={onClick}
    className={cn(
      'h-6 w-6 shrink-0 cursor-pointer rounded-full transition-all',
      !colorCss && colorClass,
      isSelected ? 'ring-border-strong ring-2 ring-offset-1' : 'hover:scale-110',
    )}
    style={colorCss ? { backgroundColor: colorCss } : undefined}
    aria-label={`Color ${colorClass}`}
  />
);
