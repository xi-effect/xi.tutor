export const EmptyDataState = ({ title }: { title: string }) => {
  return (
    <div className="flex h-[150px] w-full items-center justify-center">
      <p className="text-gray-50">{title}</p>
    </div>
  );
};
