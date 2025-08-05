import { Header, UserTile, MediaDevices } from './components';
import { WhiteboardModal } from './components/WhiteboardModal/WhiteboardModal';

export const PreJoin = () => {
  return (
    <div className="max-xs:p-4 p-8">
      <Header />
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <UserTile />
        <MediaDevices />
        <WhiteboardModal />
      </div>
    </div>
  );
};
