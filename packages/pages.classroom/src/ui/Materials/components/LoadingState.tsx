import { MaterialsListSkeleton } from '../../Overview/MaterialsListSkeleton';
import { MaterialHeader } from './MaterialHeader';

export const LoadingState = () => {
  return (
    <div>
      <div className="flex flex-col gap-4 p-4">
        <MaterialHeader title="Доски" />
        <div className="flex flex-row gap-8 pb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <MaterialsListSkeleton
              key={i}
              className="h-33.5 w-[350px] min-w-[350px] 2xl:w-[430px]"
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <MaterialHeader title="Заметки" />
        <div className="flex flex-row gap-8 pb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <MaterialsListSkeleton
              key={i}
              className="h-33.5 w-[350px] min-w-[350px] 2xl:w-[430px]"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
