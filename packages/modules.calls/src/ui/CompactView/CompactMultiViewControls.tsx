import { ArrowUp } from '@xipkg/icons';

interface CompactMultiViewControlsProps {
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Стрелки листания для развёрнутого мульти-вида ВКС:
 * сверху на первой плитке — стрелка вверх, снизу на последней — стрелка вниз
 */
export function CompactMultiViewControls({
  canPrev,
  canNext,
  onPrev,
  onNext,
}: CompactMultiViewControlsProps) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Стрелка вверх — по центру сверху (на первой плитке), если есть куда листать */}
      {canPrev && (
        <div className="pointer-events-auto absolute top-2 left-1/2 z-10 -translate-x-1/2">
          <button
            type="button"
            onClick={onPrev}
            className="bg-gray-10/80 hover:bg-gray-10 flex items-center justify-center rounded-full fill-gray-100 p-2"
            aria-label="Листать вверх"
          >
            <ArrowUp className="h-4 w-4 fill-inherit" />
          </button>
        </div>
      )}
      {/* Стрелка вниз — по центру снизу (на последней плитке) */}
      {canNext && (
        <div className="pointer-events-auto absolute bottom-2 left-1/2 z-10 -translate-x-1/2">
          <button
            type="button"
            onClick={onNext}
            className="bg-gray-10/80 hover:bg-gray-10 flex items-center justify-center rounded-full fill-gray-100 p-2"
            aria-label="Листать вниз"
          >
            <ArrowUp className="h-4 w-4 rotate-180 fill-inherit" />
          </button>
        </div>
      )}
    </div>
  );
}
