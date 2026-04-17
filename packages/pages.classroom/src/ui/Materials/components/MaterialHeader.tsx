export const MaterialHeader = ({ title }: { title: string }) => {
  return (
    <div className="flex flex-row items-center justify-start gap-2">
      <h2 className="text-xl-base font-medium text-gray-100">{title}</h2>
    </div>
  );
};
