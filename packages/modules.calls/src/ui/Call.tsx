import { ActiveRoom } from './Room/ActiveRoom';
import { PreJoin } from './PreJoin';
import { useCallStore } from '../store/callStore';
import { useInitUserDevices, useVideoSecurity } from '../hooks';
import './shared/VideoTrack/video-security.css';

export const Call = () => {
  const isStarted = useCallStore((state) => state.isStarted);

  useInitUserDevices();
  useVideoSecurity();

  return (
    <div className="h-[calc(100vh-64px)]">
      <div className="flex h-full w-full flex-col">
        {isStarted ? (
          <div id="videoConferenceContainer" className="bg-gray-0 h-full">
            <ActiveRoom />
          </div>
        ) : (
          <PreJoin />
        )}
      </div>
    </div>
  );
};
