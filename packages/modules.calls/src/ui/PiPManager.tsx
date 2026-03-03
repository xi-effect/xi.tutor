import { createPortal } from 'react-dom';
import { useLocalParticipant } from '@livekit/components-react';
import { useDocumentPiP } from '../hooks/useDocumentPiP';
import { useMedia } from 'common.utils';
import { PiPCompactCall } from './CompactView/PiPCompactCall';

/**
 * Управляет Document Picture-in-Picture для видеозвонков.
 * Должен находиться внутри LiveKitRoom, чтобы иметь доступ к useLocalParticipant.
 * Работает в любом режиме (full / compact).
 */
export function PiPManager() {
  const isMobile = useMedia('(max-width: 720px)');
  const { isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();

  const { pipWindow } = useDocumentPiP({
    enabled: !isMobile,
    width: 380,
    height: 270,
    microphoneActive: isMicrophoneEnabled,
    cameraActive: isCameraEnabled,
  });

  if (!pipWindow) return null;

  return createPortal(<PiPCompactCall />, pipWindow.document.body);
}
