import { ReactElement } from 'react';
import { Customization } from './Customization';
import { Secure } from './Secure';
import { PersonalData } from './PersonalData';
import { Notifications } from './Notifications';

type ComponentMapT = {
  [key: string]: ReactElement;
};

const componentMap: ComponentMapT = {
  personalInfo: <PersonalData />,
  personalisation: <Customization />,
  security: <Secure />,
  notifications: <Notifications />,
};

type ContentPropsT = {
  activeQuery: string;
};

export const Content = ({ activeQuery }: ContentPropsT) => {
  const activeItem = componentMap[activeQuery] || <PersonalData />;
  return <div className="w-full">{activeItem}</div>;
};
