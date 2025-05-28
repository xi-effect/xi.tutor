import { ActiveRoom } from './Room/ActiveRoom';
import { PreJoin } from './PreJoin';
import { CallProvider } from '../providers/CallProvider';
import { useCallStore } from '../store/callStore';
import { useInitUserDevices } from '../hooks';

export const Call = ({
  firstId = '1',
  secondId = '1',
}: {
  firstId?: string;
  secondId?: string;
}) => {
  const isStarted = useCallStore((state) => state.isStarted);

  useInitUserDevices();

  return (
    <div className="h-[calc(100vh-64px)]">
      <CallProvider firstId={firstId} secondId={secondId}>
        <div className="flex h-full w-full flex-col">
          {isStarted ? (
            <div id="videoConferenceContainer" className="bg-gray-0 h-full">
              <ActiveRoom />
            </div>
          ) : (
            <PreJoin />
          )}
        </div>
      </CallProvider>
    </div>
  );
};
