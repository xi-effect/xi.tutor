import { ReactElement } from 'react';
import { Customization } from '../customization';
import { Secure } from '../security';
import { PersonalData } from '../personal-data';
import { Notifications } from '../notifications';
import { SoundAndVideo } from '../sound-and-video';
import { Effects } from '../effects';
import { Board } from '../board';
import { TechnicalReport } from '../report';
import { Tags } from '../tags';
import { Schedule } from '../schedule';
import { SubscriptionSettings } from 'features.subscription';

type ComponentMapT = {
  [key: string]: ReactElement;
};

const componentMap: ComponentMapT = {
  personalInfo: <PersonalData />,
  personalisation: <Customization />,
  schedule: <Schedule />,
  security: <Secure />,
  notifications: <Notifications />,
  soundAndVideo: <SoundAndVideo />,
  effects: <Effects />,
  tags: <Tags />,
  board: <Board />,
  report: <TechnicalReport />,
  subscription: <SubscriptionSettings />,
};

type ContentPropsT = {
  activeQuery: string;
};

export const Content = ({ activeQuery }: ContentPropsT) => {
  const activeItem = componentMap[activeQuery] || <PersonalData />;

  return (
    <div className="bg-background-surface h-full min-h-0 w-full min-w-0 overflow-y-auto overscroll-contain pr-4">
      <div className="h-full pb-4">{activeItem}</div>
    </div>
  );
};
