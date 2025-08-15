export type InputWrapperPropsT = {
  children: React.ReactNode;
};

export const SocialItem = ({ children }: InputWrapperPropsT) => {
  return (
    <div className="border-gray-10 flex flex-row items-center gap-4 rounded-[12px] border p-3">
      {children}
    </div>
  );
};
