import { ScrollArea } from '@xipkg/scrollarea';
import { Header, UserTile, MediaDevices } from './components';

export const PreJoin = () => {
  return (
    <ScrollArea className="h-full w-full">
      <div className="max-xs:p-4 p-8">
        <Header />
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <UserTile />
          <MediaDevices />
        </div>
      </div>
    </ScrollArea>
  );
};
