export const MaterialHeader = ({ title }: { title: string }) => {
  return (
    <div className="flex flex-row items-center justify-start gap-2">
      <h2 className="text-xl-base text-text-primary font-medium">{title}</h2>
    </div>
  );
};
