import { ReactElement } from 'react';
import { Customization } from './Customization';
import { Secure } from './Secure';
import { PersonalData } from './PersonalData';
import { Notifications } from './Notifications';
import { Effects } from './Effects';
import { TechnicalReport } from './TechnicalReport';

type ComponentMapT = {
  [key: string]: ReactElement;
};

const componentMap: ComponentMapT = {
  personalInfo: <PersonalData />,
  personalisation: <Customization />,
  security: <Secure />,
  notifications: <Notifications />,
  effects: <Effects />,
  report: <TechnicalReport />,
};

type ContentPropsT = {
  activeQuery: string;
};

export const Content = ({ activeQuery }: ContentPropsT) => {
  const activeItem = componentMap[activeQuery] || <PersonalData />;

  return (
    <div className="bg-gray-0 h-full min-h-0 w-full min-w-0 overflow-y-auto overscroll-contain pr-4">
      <div className="pb-4">{activeItem}</div>
    </div>
  );
};
