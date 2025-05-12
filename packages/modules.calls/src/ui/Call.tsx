import { Room } from 'livekit-client';
import { useParams } from '@tanstack/react-router';
import { ActiveRoom } from './Room/ActiveRoom';
import { PreJoin } from './PreJoin';
import { CallProvider } from '../providers/CallProvider';
import { useLivekitToken } from '../hooks/useLivekitToken';
import { useCallStore } from '../store/callStore';

export const Call = () => {
  const room = new Room();

  const isStarted = useCallStore((state) => state.isStarted);

  // TODO: This is a temporary solution to get the communityId and channelId from the URL.
  const { communityId = '1', channelId = '1' } = useParams({
    from: '/communities/$communityId/channels/$channelId',
  });
  const { token } = useLivekitToken(communityId, channelId);

  return (
    <CallProvider>
      <div>
        {isStarted && token ? (
          <div id="videoConferenceContainer" className="bg-gray-5" data-theme="dark">
            <ActiveRoom room={room} token={token} />
          </div>
        ) : (
          <PreJoin />
        )}
      </div>
    </CallProvider>
  );
};
