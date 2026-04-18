export const NotFoundItems = ({ text }: { text: string }) => {
  return (
    <div className="text-gray-60 mt-8 flex h-[calc(100vh-272px)] items-center justify-center text-xl md:text-2xl">
      {text}
    </div>
  );
};
