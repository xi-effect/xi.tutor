import { useCallStore } from '../../../../store/callStore';

export const UserTile = () => {
  const videoEnabled = useCallStore((state) => state.videoEnabled);
  const isStarted = useCallStore((state) => state.isStarted);
  const updateStore = useCallStore((state) => state.updateStore);

  return (
    <div className="bg-gray-10 flex flex-col rounded-lg p-4">
      <div className="bg-gray-5 mb-4 aspect-video rounded-lg">
        {/* Здесь будет предпросмотр видео с камеры */}
        <div className="flex h-full flex-col items-center justify-center text-gray-100">
          {videoEnabled ? 'Предпросмотр видео' : 'Камера отключена'}
        </div>
      </div>

      <button
        className="bg-brand-80 hover:bg-brand-60 mt-auto h-10 rounded-md text-white transition-colors"
        onClick={() => updateStore('isStarted', !isStarted)}
      >
        Присоединиться к звонку
      </button>
    </div>
  );
};
