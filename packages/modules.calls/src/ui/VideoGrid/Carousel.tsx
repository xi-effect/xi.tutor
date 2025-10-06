import { ArrowUp } from '@xipkg/icons';
import { OrientationLayoutT } from './VideoGridLayout';

type CarouselPropsT = {
  children: React.ReactNode;
  handleNext: () => void;
  handlePrev: () => void;
  handleCheckDisabled: (type: 'prev' | 'next') => boolean;
};

type NavigationButtonProps = {
  onClick: () => void;
  disabled: boolean;
  orientation: 'vertical' | 'horizontal' | 'grid';
  direction: 'prev' | 'next';
};

const NavigationButton = ({ onClick, disabled, orientation, direction }: NavigationButtonProps) => {
  const getRotation = () => {
    if (orientation === 'horizontal') {
      return direction === 'prev' ? '-rotate-90' : 'rotate-90';
    }
    if (orientation === 'grid') {
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
      <div className="bg-gray-0 flex items-center justify-center rounded-full p-2">
        <ArrowUp className={`${getRotation()} fill-inherit`} />
      </div>
      <span className="sr-only">{direction === 'prev' ? 'Prev' : 'Next'}</span>
    </button>
  );
};

export const Carousel = ({
  children,
  orientation,
  handleNext,
  handleCheckDisabled,
  handlePrev,
}: CarouselPropsT & OrientationLayoutT) => (
  <div className="mx-auto h-full w-full">
    <div className="relative h-full overflow-hidden">
      <div
        className={`absolute inset-0 flex items-center justify-between ${orientation === 'horizontal' ? 'flex-row' : 'flex-col'}`}
      >
        <NavigationButton
          onClick={handlePrev}
          disabled={handleCheckDisabled('prev')}
          orientation={orientation}
          direction="prev"
        />
        <NavigationButton
          onClick={handleNext}
          disabled={handleCheckDisabled('next')}
          orientation={orientation}
          direction="next"
        />
      </div>
      <div
        className={`${orientation === 'vertical' ? 'my-14 flex h-[calc(100vh-20rem)] flex-col' : 'mx-14'} relative z-0 flex h-full w-full touch-pan-x snap-x snap-mandatory gap-5 overflow-hidden scroll-smooth`}
      >
        {children}
      </div>
    </div>
  </div>
);
