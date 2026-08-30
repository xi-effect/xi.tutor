import React from 'react';
import { CardSkeleton } from '../skeletons';

interface CardsGridSkeletonProps {
  count?: number;
}

/** Сетка как у GridVirtualizer: 1 колонка ≤960px, иначе auto-fill min 300px (maxColumns 4). */
export const CardsGridSkeleton: React.FC<CardsGridSkeletonProps> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-1 gap-5 min-[961px]:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="classroom-card min-w-0">
          <CardSkeleton />
        </div>
      ))}
    </div>
  );
};
