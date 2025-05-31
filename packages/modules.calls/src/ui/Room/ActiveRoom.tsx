import { BottomBar } from '../Bottom';
import { VideoGrid } from '../VideoGrid';
import { UpBar } from '../Up';

export const ActiveRoom = () => {
  return (
    <div className="flex h-full flex-col justify-stretch">
      <UpBar />
      <div className="flex h-full items-center justify-center px-4">
        <div className="h-full w-full text-center text-gray-100">
          <VideoGrid />
        </div>
      </div>
      <BottomBar />
    </div>
  );
};
