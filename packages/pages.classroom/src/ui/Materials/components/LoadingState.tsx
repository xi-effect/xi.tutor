import { ClassroomCardsRow, MaterialCardSkeleton } from '../../Skeletons/classroomSkeletons';
import { MaterialHeader } from './MaterialHeader';

export const LoadingState = () => {
  return (
    <div>
      <div className="flex flex-col gap-4 p-4">
        <MaterialHeader title="Учебные доски" />
        <ClassroomCardsRow className="pb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <MaterialCardSkeleton key={i} className="h-33.5 2xl:w-[430px]" />
          ))}
        </ClassroomCardsRow>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <MaterialHeader title="Заметки" />
        <ClassroomCardsRow className="pb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <MaterialCardSkeleton key={i} className="h-33.5 2xl:w-[430px]" />
          ))}
        </ClassroomCardsRow>
      </div>
    </div>
  );
};
