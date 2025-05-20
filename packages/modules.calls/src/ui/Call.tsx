import { Room } from 'livekit-client';
import { ActiveRoom } from './Room/ActiveRoom';
import { PreJoin } from './PreJoin';
import { CallProvider } from '../providers/CallProvider';
import { useLivekitToken } from '../hooks/useLivekitToken';
import { useCallStore } from '../store/callStore';
import { useInitUserDevices } from '../hooks';

export const Call = ({
  firstId = '1',
  secondId = '1',
}: {
  firstId?: string;
  secondId?: string;
}) => {
  const room = new Room();

  const isStarted = useCallStore((state) => state.isStarted);

  useInitUserDevices();

  // TODO: This is a temporary solution to get the communityId and channelId from the URL.
  const { token = null } = useLivekitToken(firstId, secondId);

  return (
    <div className="h-[calc(100vh-64px)]">
      <CallProvider firstId={firstId} secondId={secondId}>
        <div className="flex h-full w-full flex-col">
          {isStarted ? (
            <div id="videoConferenceContainer" className="bg-gray-5 h-full">
              <ActiveRoom room={room} token={token || ''} />
            </div>
          ) : (
            <PreJoin />
          )}
        </div>
      </CallProvider>
    </div>
  );
};
