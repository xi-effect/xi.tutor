import { BottomBar } from '../Bottom';
import { VideoGrid } from '../VideoGrid';
import { UpBar } from '../Up';
import { Chat } from '../Chat/Chat';

export const ActiveRoom = () => {
  return (
    <div className="flex h-full flex-col justify-stretch">
      <UpBar />
      <div className="flex h-full items-center justify-center gap-4 px-4">
        <div className="h-full w-full text-center text-gray-100">
          <VideoGrid />
        </div>
        <Chat />
      </div>
      <BottomBar />
    </div>
  );
};
