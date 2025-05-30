import { Button } from '@xipkg/button';
import { MediaDeviceMenu } from './MediaDeviceMenu';
import { useCallStore } from '../../../../store/callStore';

export const MediaDevices = () => {
  const audioDeviceId = useCallStore((state) => state.audioDeviceId);
  const audioOutputDeviceId = useCallStore((state) => state.audioOutputDeviceId);
  const audioEnabled = useCallStore((state) => state.audioEnabled);

  const videoDeviceId = useCallStore((state) => state.videoDeviceId);
  const videoEnabled = useCallStore((state) => state.videoEnabled);

  const updateStore = useCallStore((state) => state.updateStore);

  const handleJoin = () => {
    updateStore('isStarted', true);
    updateStore('connect', true);
  };

  return (
    <div className="border-gray-30 flex flex-col justify-between rounded-[16px] border p-5">
      <div>
        <div className="mb-8">
          <h2 className="mb-1 font-sans">Камера</h2>
          <MediaDeviceMenu
            disabled={!videoEnabled}
            initialSelection={(videoDeviceId as string) || undefined}
            kind="videoinput"
            onActiveDeviceChange={(_, id) => updateStore('videoDeviceId', id)}
          />
        </div>
        <div className="my-4">
          <h2 className="mb-1 font-sans">Звук</h2>
          <div className="flex flex-col gap-2">
            <MediaDeviceMenu
              disabled={!audioEnabled}
              initialSelection={(audioDeviceId as string) || undefined}
              kind="audioinput"
              onActiveDeviceChange={(_, id) => updateStore('audioDeviceId', id)}
            />
            <MediaDeviceMenu
              initialSelection={(audioOutputDeviceId as string) || undefined}
              kind="audiooutput"
              onActiveDeviceChange={(_, id) => updateStore('audioOutputDeviceId', id)}
            />
          </div>
        </div>
      </div>
      <Button onClick={() => handleJoin()} className="w-full">
        Присоединиться
      </Button>
    </div>
  );
};
