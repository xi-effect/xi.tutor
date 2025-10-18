export type LoaderPropsT = {
  isLoading: boolean;
  isFetchingNextPage: boolean;
};

export const Loader = ({ isLoading, isFetchingNextPage }: LoaderPropsT) =>
  isLoading || isFetchingNextPage ? (
    <div className="flex justify-center py-4">
      <div className="text-gray-60">Загрузка...</div>
    </div>
  ) : null;
