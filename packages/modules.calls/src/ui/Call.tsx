import { ActiveRoom } from './Room/ActiveRoom';
import { PreJoin } from './PreJoin';
import { useCallStore } from '../store/callStore';
import { useInitUserDevices, useVideoSecurity } from '../hooks';
import { useFocusModeStore } from 'common.ui';
import './shared/VideoTrack/video-security.css';
import { useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';

export const Call = () => {
  const isStarted = useCallStore((state) => state.isStarted);
  const focusMode = useFocusModeStore((s) => s.focusMode);

  useInitUserDevices();
  useVideoSecurity();

  const pathname = useLocation().pathname;
  const mode = useCallStore((state) => state.mode);
  const updateStore = useCallStore((state) => state.updateStore);

  useEffect(() => {
    // Проверяем, что мы находимся на странице /call/<callId> (точное совпадение)
    const isOnCallPage = /^\/call\/[^/]+$/.test(pathname);

    // Если мы на странице звонка и режим compact, переключаем на full
    if (isOnCallPage && mode === 'compact') {
      updateStore('mode', 'full');
    }
  }, [pathname, mode, updateStore]);

  return (
    <div
      className={'h-full'}
      style={
        focusMode
          ? ({
              '--header-height': '0px',
              '--available-height':
                'calc(100dvh - 0px - var(--upbar-height) - var(--bottom-bar-height))',
            } as React.CSSProperties)
          : undefined
      }
    >
      <div className="flex h-full w-full flex-col">
        {isStarted ? (
          <div id="videoConferenceContainer" className="bg-gray-5 h-full">
            <ActiveRoom />
          </div>
        ) : (
          <PreJoin />
        )}
      </div>
    </div>
  );
};
