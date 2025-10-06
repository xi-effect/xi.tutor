import { getTrackReferenceId } from '@livekit/components-core';
import { TrackLoopProps, TrackRefContext } from '@livekit/components-react';
import { OrientationLayoutT } from './VideoGridLayout';
import { Carousel } from './Carousel';
import { Children, isValidElement, cloneElement, useState } from 'react';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';

export type TrackLoopT = {
  maxVisibleTiles: number;
};

const cloneSingleChild = (
  children: React.ReactNode | React.ReactNode[],
  props?: Record<string, unknown>,
  key?: React.Key,
) =>
  Children.map(children, (child) => {
    if (isValidElement(child) && Children.only(children)) {
      return cloneElement(child, { ...props, key });
    }
    return child;
  });

export const SliderVideoGrid = ({
  tracks,
  maxVisibleTiles,
  orientation,
  ...props
}: TrackLoopProps & TrackLoopT & OrientationLayoutT) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleTracks = tracks.slice(currentIndex, currentIndex + maxVisibleTiles);

  const isPrevDisabled = currentIndex - maxVisibleTiles < 0;
  const isNextDisabled = currentIndex + maxVisibleTiles >= tracks.length;

  const handleCheckDisabled = (type: 'prev' | 'next') => {
    return type === 'prev' ? isPrevDisabled : isNextDisabled;
  };

  const handleNext = () => {
    if (currentIndex + maxVisibleTiles < tracks.length) {
      setCurrentIndex(currentIndex + maxVisibleTiles);
    }
  };

  const handlePrev = () => {
    if (currentIndex - maxVisibleTiles >= 0) {
      setCurrentIndex(currentIndex - maxVisibleTiles);
    }
  };

  return (
    visibleTracks.length > 0 && (
      <Carousel
        handleNext={handleNext}
        handlePrev={handlePrev}
        handleCheckDisabled={handleCheckDisabled}
        orientation={orientation}
      >
        {visibleTracks.map((trackReference: TrackReferenceOrPlaceholder, index: number) => (
          <TrackRefContext.Provider
            value={trackReference}
            key={getTrackReferenceId(trackReference)}
          >
            <div key={index} className="text-center">
              <div className="text-gray-0 mx-auto h-full w-full text-xl">
                {cloneSingleChild(props.children)}
              </div>
            </div>
          </TrackRefContext.Provider>
        ))}
      </Carousel>
    )
  );
};
