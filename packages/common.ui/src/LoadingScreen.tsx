export const LoadingScreen = () => {
  return (
    <div className="bg-gray-0 flex h-[100dvh] w-screen flex-col items-center justify-center md:h-screen">
      <div className="flex flex-auto flex-col items-center justify-center p-4 md:p-5">
        <div className="flex justify-center">
          <div
            className="text-brand-80 inline-block size-6 animate-spin rounded-full border-[3px] border-current border-t-transparent"
            role="status"
            aria-label="loading"
          >
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
};
