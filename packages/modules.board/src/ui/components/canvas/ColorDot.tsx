import { cn } from '@xipkg/utils';

type ColorDotProps = {
  colorClass: string;
  isSelected: boolean;
  onClick: () => void;
};

export const ColorDot = ({ colorClass, isSelected, onClick }: ColorDotProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'h-6 w-6 shrink-0 cursor-pointer rounded-full transition-all',
      colorClass,
      isSelected ? 'ring-2 ring-gray-100 ring-offset-1' : 'hover:scale-110',
    )}
    aria-label={`Color ${colorClass}`}
  />
);
