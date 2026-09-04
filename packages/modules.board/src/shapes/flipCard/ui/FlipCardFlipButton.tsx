import { Button } from '@xipkg/button';
import { BUTTON_BORDER_RADIUS_RATIO, BUTTON_FONT_SIZE_RATIO } from '../consts';

type FlipCardFlipButtonProps = {
  size: number;
  onClick: (e: React.MouseEvent) => void;
};

export const FlipCardFlipButton = ({ size, onClick }: FlipCardFlipButtonProps) => (
  <div
    className="absolute bottom-2 left-1/2 z-50 flex -translate-x-1/2 gap-1"
    onPointerDown={(e) => e.stopPropagation()}
  >
    <Button
      size="s"
      variant="secondary"
      onClick={onClick}
      className="pointer-events-auto"
      style={{
        height: size,
        fontSize: size * BUTTON_FONT_SIZE_RATIO,
        borderRadius: size * BUTTON_BORDER_RADIUS_RATIO,
      }}
    >
      Перевернуть
    </Button>
  </div>
);
