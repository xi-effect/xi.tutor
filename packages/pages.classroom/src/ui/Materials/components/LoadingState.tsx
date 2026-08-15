import { MaterialsListSkeleton } from '../../Overview/MaterialsListSkeleton';

export const LoadingState = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
    {Array.from({ length: 8 }).map((_, i) => (
      <MaterialsListSkeleton key={i} />
    ))}
  </div>
);
