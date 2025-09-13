import React from 'react';
import { CardSkeletonAdvanced } from '../skeletons';

interface CardsGridSkeletonAdvancedProps {
  count?: number;
  className?: string;
}

export const CardsGridSkeletonAdvanced: React.FC<CardsGridSkeletonAdvancedProps> = ({
  count = 12,
  className = '',
}) => {
  return (
    <div
      className={`max-xs:gap-4 grid grid-cols-1 gap-8 pr-4 min-[550px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="classroom-card">
          <CardSkeletonAdvanced />
        </div>
      ))}
    </div>
  );
};
