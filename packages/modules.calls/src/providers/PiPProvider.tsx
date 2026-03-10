import { createContext, useCallback, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocalParticipant } from '@livekit/components-react';
import { useDocumentPiP } from '../hooks/useDocumentPiP';
import { useCallStore } from '../store/callStore';
import { useRoom } from './RoomProvider';
import { useMedia } from 'common.utils';
import { useCompactNavigation } from '../hooks/useCompactNavigation';
import { PiPCompactCall } from '../ui/CompactView/PiPCompactCall';
import {
  getPipHeightExpandedPx,
  PIP_EXTRA_HEIGHT_PX,
  PIP_HEIGHT_BASIC_PX,
  PIP_PANEL_WIDTH_PX,
} from '../ui/CompactView/constants';

type PiPContextValue = {
  openPiP: () => Promise<void>;
  isPiPActive: boolean;
  isSupported: boolean;
};

const PiPContext = createContext<PiPContextValue | null>(null);

export function usePiP() {
  const ctx = useContext(PiPContext);
  return ctx;
}

function getMediaStreamTrack(
  pub: { track?: { mediaStreamTrack?: MediaStreamTrack } } | undefined,
): MediaStreamTrack | undefined {
  return pub?.track?.mediaStreamTrack;
}

function useMediaCaptureLive() {
  const { microphoneTrack, cameraTrack } = useLocalParticipant();
  const micTrack = getMediaStreamTrack(microphoneTrack);
  const camTrack = getMediaStreamTrack(cameraTrack);
  const micLive = !!micTrack && micTrack.readyState === 'live' && micTrack.enabled;
  const camLive = !!camTrack && camTrack.readyState === 'live' && camTrack.enabled;
  return { micLive, camLive };
}

type PiPProviderProps = {
  children: React.ReactNode;
};

/**
 * Предоставляет API PiP (openPiP, isSupported) дочерним компонентам и управляет
 * Document Picture-in-Picture (логика из PiPManager).
 */
export function PiPProvider({ children }: PiPProviderProps) {
  const isMobile = useMedia('(max-width: 720px)');
  const { micLive, camLive } = useMediaCaptureLive();
  const { room } = useRoom();
  const compactViewMode = useCallStore((s) => s.compactViewMode);
  const { totalParticipants } = useCompactNavigation();

  const {
    pipWindow,
    closePiP,
    resizePiP,
    openPiP: openPiPRaw,
    isSupported,
  } = useDocumentPiP({
    enabled: !isMobile,
    width: PIP_PANEL_WIDTH_PX,
    height: PIP_HEIGHT_BASIC_PX,
    microphoneActive: micLive,
    cameraActive: camLive,
  });

  const openPiP = useCallback(async () => {
    const height =
      compactViewMode === 'basic' ? PIP_HEIGHT_BASIC_PX : getPipHeightExpandedPx(totalParticipants);
    await openPiPRaw({ height });
  }, [openPiPRaw, compactViewMode, totalParticipants]);

  useEffect(() => {
    if (!room || !pipWindow) return;
    if (room.state !== 'connected') {
      closePiP();
      return;
    }
    const handleState = () => {
      if (room.state !== 'connected') closePiP();
    };
    room.on('connectionStateChanged', handleState);
    return () => {
      room.off('connectionStateChanged', handleState);
    };
  }, [room, pipWindow, closePiP]);

  useEffect(() => {
    if (!pipWindow || !resizePiP) return;
    const height =
      compactViewMode === 'basic'
        ? PIP_HEIGHT_BASIC_PX + PIP_EXTRA_HEIGHT_PX
        : getPipHeightExpandedPx(totalParticipants);
    resizePiP(PIP_PANEL_WIDTH_PX, height);
  }, [pipWindow, resizePiP, compactViewMode, totalParticipants]);

  const value: PiPContextValue = {
    openPiP,
    isPiPActive: pipWindow !== null,
    isSupported: isSupported && !isMobile,
  };

  return (
    <PiPContext.Provider value={value}>
      {children}
      {pipWindow && createPortal(<PiPCompactCall pipWindow={pipWindow} />, pipWindow.document.body)}
    </PiPContext.Provider>
  );
}
