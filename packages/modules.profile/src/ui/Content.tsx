import { ReactElement } from 'react';
import { Customization } from './Customization';
import { Secure } from './Secure';
import { PersonalData } from './PersonalData';
import { Notifications } from './Notifications';
import { Effects } from './Effects';
import { TechnicalReport } from './TechnicalReport';
import { CameraSettings } from './CameraSettings';

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
  cameraSettings: <CameraSettings />,
};

type ContentPropsT = {
  activeQuery: string;
};

export const Content = ({ activeQuery }: ContentPropsT) => {
  const activeItem = componentMap[activeQuery] || <PersonalData />;
  return <div className="w-full">{activeItem}</div>;
};
