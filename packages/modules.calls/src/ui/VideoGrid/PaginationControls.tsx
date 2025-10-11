import { ArrowUp } from '@xipkg/icons';

type Orientation = 'vertical' | 'horizontal';

interface PaginationControlsProps {
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  orientation?: Orientation;
}

type NavigationButtonProps = {
  onClick: () => void;
  disabled: boolean;
  orientation: 'vertical' | 'horizontal';
  direction: 'prev' | 'next';
};

const NavigationButton = ({ onClick, disabled, orientation, direction }: NavigationButtonProps) => {
  const getRotation = () => {
    if (orientation === 'horizontal') {
      return direction === 'prev' ? '-rotate-90' : 'rotate-90';
    }
    return direction === 'prev' ? '' : 'rotate-180';
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="disabled:fill-gray-80 z-10 bg-transparent fill-gray-100 p-0 text-center hover:opacity-100 disabled:cursor-not-allowed"
    >
      <div className="bg-gray-0/80 flex items-center justify-center rounded-full p-2">
        <ArrowUp className={`${getRotation()} fill-inherit`} />
      </div>
      <span className="sr-only">
        {direction === 'prev' ? 'Предыдущая страница' : 'Следующая страница'}
      </span>
    </button>
  );
};

/**
 * Кнопки навигации для карусели
 * Адаптируются под ориентацию (вертикальная/горизонтальная)
 * Использует стиль кнопок из Carousel.tsx
 */
export function PaginationControls({
  canPrev,
  canNext,
  onPrev,
  onNext,
  orientation = 'vertical',
}: PaginationControlsProps) {
  const isVertical = orientation === 'vertical';

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Кнопка "Назад" */}
      <div
        className={
          isVertical
            ? 'pointer-events-auto absolute top-2 left-1/2 -translate-x-1/2'
            : 'pointer-events-auto absolute top-1/2 left-2 -translate-y-1/2'
        }
      >
        <NavigationButton
          onClick={onPrev}
          disabled={!canPrev}
          orientation={orientation}
          direction="prev"
        />
      </div>

      {/* Кнопка "Вперед" */}
      <div
        className={
          isVertical
            ? 'pointer-events-auto absolute bottom-2 left-1/2 -translate-x-1/2'
            : 'pointer-events-auto absolute top-1/2 right-2 -translate-y-1/2'
        }
      >
        <NavigationButton
          onClick={onNext}
          disabled={!canNext}
          orientation={orientation}
          direction="next"
        />
      </div>
    </div>
  );
}
