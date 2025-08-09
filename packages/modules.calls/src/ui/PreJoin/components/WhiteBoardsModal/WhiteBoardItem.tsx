type WhiteBoardItemPropsT = {
  name: string;
};

export const WhiteBoardItem = ({ name }: WhiteBoardItemPropsT) => {
  return (
    <div className="border-gray-30 col-span-1 flex min-h-19.5 flex-col justify-between gap-4 rounded-2xl border p-3 hover:border-gray-50">
      <h3 className="text-m-base font-medium text-gray-100">{name}</h3>
      <span className="text-xs-base text-gray-80 font-medium">Изменено: 5 августа</span>
    </div>
  );
};
