import React from 'react';
import { CardSkeletonAdvanced } from '../skeletons';

interface CardsGridSkeletonAdvancedProps {
  count?: number;
  className?: string;
}

/** Сетка как у GridVirtualizer списка кабинетов: 1 колонка ≤960px, иначе auto-fill min 300px. */
export const CardsGridSkeletonAdvanced: React.FC<CardsGridSkeletonAdvancedProps> = ({
  count = 12,
  className = '',
}) => {
  return (
    <div
      className={`grid grid-cols-1 gap-5 min-[961px]:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="classroom-card min-w-0">
          <CardSkeletonAdvanced />
        </div>
      ))}
    </div>
  );
};
