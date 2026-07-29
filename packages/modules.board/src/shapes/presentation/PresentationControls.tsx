import { Button } from '@xipkg/button';
import { ArrowLeft, ArrowRight } from '@xipkg/icons';

type PresentationControlsProps = {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
};
export const PresentationControls = ({
  current,
  total,
  onPrev,
  onNext,
}: PresentationControlsProps) => {
  const isDisabled = total === 0;

  return (
    <div className="pointer-events-auto relative z-50 flex items-center justify-center gap-4">
      <Button
        onPointerDown={onPrev}
        disabled={current <= 1 || isDisabled}
        className="text-gray-0 size-12 rounded-full"
      >
        <ArrowLeft className="text-gray-0" />
      </Button>

      <span className="text-m-base">{total > 0 ? `${current} / ${total}` : 'Загрузка...'}</span>

      <Button
        onPointerDown={onNext}
        disabled={current >= total || isDisabled}
        className="text-gray-0 size-12 rounded-full"
      >
        <ArrowRight className="text-gray-0" />
      </Button>
    </div>
  );
};
