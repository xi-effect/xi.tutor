import { EventItemPropsT } from './types';

const colorClasses = {
  brand: {
    border: 'bg-brand-80',
    hoverText: 'group-hover:text-brand-80',
    hoverBg: 'hover:bg-brand-0',
  },
  green: {
    border: 'bg-green-80',
    hoverText: 'group-hover:text-green-80',
    hoverBg: 'hover:bg-green-0',
  },
};

export const EventItem = ({ name, description, time, color = 'brand' }: EventItemPropsT) => {
  const currentColor = colorClasses[color];

  return (
    <div
      className={`group relative flex cursor-pointer flex-col rounded-tr-lg rounded-br-lg pl-2 transition-colors ${currentColor.hoverBg}`}
    >
      <div className={`${currentColor.border} absolute top-0 left-0 h-full w-1 rounded-full`} />
      <h6 className={`${currentColor.hoverText} text-base font-medium transition-colors`}>
        {name}
      </h6>
      <p className={`text-gray-80 ${currentColor.hoverText} text-s-base transition-colors`}>
        {description}
      </p>
      <span className={`text-gray-80 ${currentColor.hoverText} text-xs-base transition-colors`}>
        {time}
      </span>
    </div>
  );
};
