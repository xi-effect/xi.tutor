export type InputWrapperPropsT = {
  children: React.ReactNode;
  tab?: number;
};

export const InputWrapper = ({ children, tab }: InputWrapperPropsT) => {
  return (
    <div
      className="border-gray-10 flex flex-row items-center gap-4 rounded-[12px] border p-3"
      tabIndex={tab}
    >
      {children}
    </div>
  );
};
