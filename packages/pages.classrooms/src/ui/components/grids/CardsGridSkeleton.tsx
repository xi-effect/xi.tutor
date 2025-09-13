import React from 'react';
import { CardSkeleton } from '../skeletons';

interface CardsGridSkeletonProps {
  count?: number;
}

export const CardsGridSkeleton: React.FC<CardsGridSkeletonProps> = ({ count = 12 }) => {
  return (
    <div className="max-xs:gap-4 grid grid-cols-1 gap-8 min-[550px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="classroom-card">
          <CardSkeleton />
        </div>
      ))}
    </div>
  );
};
