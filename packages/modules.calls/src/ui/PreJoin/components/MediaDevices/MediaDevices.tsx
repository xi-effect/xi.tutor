import { useCallStore } from '../../../../store/callStore';

export const MediaDevices = () => {
  const audioEnabled = useCallStore((state) => state.audioEnabled);
  const videoEnabled = useCallStore((state) => state.videoEnabled);
  const updateStore = useCallStore((state) => state.updateStore);

  return (
    <div className="bg-gray-10 flex flex-col rounded-lg p-4">
      <h2 className="mb-4 text-xl font-semibold text-gray-100">Устройства</h2>

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <label className="text-gray-100">Микрофон</label>
          <button
            className={`h-6 w-12 rounded-full ${audioEnabled ? 'bg-green-500' : 'bg-gray-80'} transition-colors`}
            onClick={() => updateStore('audioEnabled', !audioEnabled)}
          >
            <div
              className={`h-4 w-4 transform rounded-full bg-white transition-transform ${audioEnabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between">
          <label className="text-gray-100">Камера</label>
          <button
            className={`h-6 w-12 rounded-full ${videoEnabled ? 'bg-green-500' : 'bg-gray-80'} transition-colors`}
            onClick={() => updateStore('videoEnabled', !videoEnabled)}
          >
            <div
              className={`h-4 w-4 transform rounded-full bg-white transition-transform ${videoEnabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
