import React from 'react';
import { CardSkeleton } from '../skeletons';

interface CardsGridSkeletonProps {
  count?: number;
}

export const CardsGridSkeleton: React.FC<CardsGridSkeletonProps> = ({ count = 12 }) => {
  return (
    <div className="max-xs:gap-4 grid grid-cols-1 gap-5 px-5 pb-5 min-[550px]:grid-cols-2 sm:px-10 sm:pb-10 md:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="classroom-card">
          <CardSkeleton />
        </div>
      ))}
    </div>
  );
};
