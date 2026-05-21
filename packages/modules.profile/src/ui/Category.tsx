type CategoryProps = {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
};

export const Category = ({ icon, title, children }: CategoryProps) => (
  <div className="border-gray-30 rounded-2xl border p-4">
    <div className="mb-4 flex items-center gap-2">
      {icon}
      <span className="text-base font-semibold dark:text-gray-100">{title}</span>
    </div>
    <div className="flex flex-col">{children}</div>
  </div>
);
