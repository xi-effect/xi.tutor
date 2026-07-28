import { EventItemPropsT } from './types';

const colorClasses = {
  brand: {
    border: 'bg-action-primary-background-default',
    hoverText: 'group-hover:text-text-link',
    hoverBg: 'hover:bg-status-info-background',
  },
  green: {
    border: 'bg-status-success-accent',
    hoverText: 'group-hover:text-status-success-text',
    hoverBg: 'hover:bg-status-success-background',
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
      <p className={`text-text-primary ${currentColor.hoverText} text-s-base transition-colors`}>
        {description}
      </p>
      <span
        className={`text-text-primary ${currentColor.hoverText} text-xs-base transition-colors`}
      >
        {time}
      </span>
    </div>
  );
};
