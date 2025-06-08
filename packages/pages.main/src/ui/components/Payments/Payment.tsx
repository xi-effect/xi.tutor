export const Payment = () => {
  return (
    <div className="border-gray-60 flex min-h-[96px] min-w-[350px] flex-col items-start justify-start gap-2 rounded-2xl border p-4">
      <span className="text-s-base text-gray-80 font-medium">11 мая, 12:32</span>
      <div className="flex flex-row items-baseline gap-0.5">
        <h3 className="text-h6 font-medium text-gray-100">320</h3>
        <span className="text-m-base text-gray-60 font-medium">₽</span>
      </div>
    </div>
  );
};
