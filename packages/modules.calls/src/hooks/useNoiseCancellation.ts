import { useCallback, useEffect, useRef, useState } from 'react';
import { Room, Track, LocalAudioTrack } from 'livekit-client';
import { useUserChoicesStore } from '../store/userChoices';
import type { NoiseCancellationMode } from '../types/noiseCancellation';
import { allowKrispNoiseCancellation, noiseCancellationFeatureEnabled } from '../utils/config';
import {
  trackNoiseCancellationEvent,
  NOISE_CANCELLATION_EVENTS,
} from '../utils/noiseCancellationTelemetry';

/** Сообщение при ошибке аутентификации Krisp (404 / нет LiveKit Cloud). */
const KRISP_AUTH_ERROR_MESSAGE = 'Усиленное шумоподавление недоступно (требуется LiveKit Cloud).';

function isKrispAuthError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('Could not authenticate') ||
    (msg.includes('404') && msg.toLowerCase().includes('status'))
  );
}

type KrispProcessor = {
  setEnabled: (enable: boolean) => Promise<boolean | undefined>;
  isEnabled: () => boolean;
};

function getLocalAudioTrackFromRoom(room: Room): LocalAudioTrack | undefined {
  const pub = room.localParticipant?.getTrackPublication(Track.Source.Microphone);
  const track = pub?.track;
  return track instanceof LocalAudioTrack ? track : undefined;
}

async function loadKrispSupport(): Promise<boolean> {
  try {
    const mod = await import('@livekit/krisp-noise-filter');
    return (
      typeof mod.isKrispNoiseFilterSupported === 'function' && mod.isKrispNoiseFilterSupported()
    );
  } catch {
    return false;
  }
}

async function createKrispProcessor(): Promise<KrispProcessor | null> {
  try {
    const { KrispNoiseFilter } = await import('@livekit/krisp-noise-filter');
    return KrispNoiseFilter() as unknown as KrispProcessor;
  } catch {
    return null;
  }
}

export type UseNoiseCancellationOptions = {
  /** Локальный аудиотрек при отсутствии комнаты (PreJoin). */
  localAudioTrack?: LocalAudioTrack | null;
};

export type UseNoiseCancellationResult = {
  isEnabled: boolean;
  mode: NoiseCancellationMode;
  /** Фактически применённый режим (может быть webrtc при fallback с krisp). */
  effectiveMode: NoiseCancellationMode;
  setEnabled: (enabled: boolean) => void;
  setMode: (mode: NoiseCancellationMode) => void;
  isApplying: boolean;
  isKrispSupported: boolean | null;
  lastError: string | null;
  /** Флаг из конфига: показывать ли опцию Krisp в UI. */
  allowKrisp: boolean;
};

export function useNoiseCancellation(
  room: Room | null,
  options: UseNoiseCancellationOptions = {},
): UseNoiseCancellationResult {
  const { localAudioTrack: fallbackLocalAudioTrack } = options;

  const noiseCancellationEnabled = useUserChoicesStore((s) => s.noiseCancellationEnabled ?? false);
  const noiseCancellationMode = useUserChoicesStore((s) => s.noiseCancellationMode ?? 'webrtc');
  const setStoreEnabled = useCallback((enabled: boolean) => {
    useUserChoicesStore.setState({ noiseCancellationEnabled: enabled });
  }, []);
  const setStoreMode = useCallback((mode: NoiseCancellationMode) => {
    useUserChoicesStore.setState({ noiseCancellationMode: mode });
  }, []);
  const setStoreModeRef = useRef(setStoreMode);
  setStoreModeRef.current = setStoreMode;

  const [roomAudioTrack, setRoomAudioTrack] = useState<LocalAudioTrack | null>(null);
  const [isKrispSupported, setIsKrispSupported] = useState<boolean | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const setLastErrorRef = useRef(setLastError);
  setLastErrorRef.current = setLastError;
  const krispProcessorRef = useRef<KrispProcessor | null>(null);
  const krispSupportCheckedRef = useRef(false);
  const previousTrackRef = useRef<LocalAudioTrack | null | undefined>(undefined);

  const resolvedTrack: LocalAudioTrack | null | undefined = room
    ? roomAudioTrack
    : (fallbackLocalAudioTrack ?? null);

  useEffect(() => {
    if (!room) {
      setRoomAudioTrack(null);
      return;
    }
    const updateTrack = () => {
      setRoomAudioTrack(getLocalAudioTrackFromRoom(room) ?? null);
    };
    updateTrack();
    room.on('localTrackPublished', updateTrack);
    room.on('localTrackUnpublished', updateTrack);
    return () => {
      room.off('localTrackPublished', updateTrack);
      room.off('localTrackUnpublished', updateTrack);
      setRoomAudioTrack(null);
    };
  }, [room]);

  const resolvedTrackRef = useRef(resolvedTrack);
  resolvedTrackRef.current = resolvedTrack;

  // Ошибка 404/Could not authenticate приходит асинхронно из Krisp (onPublish), поэтому
  // перехватываем unhandledrejection и делаем fallback на webrtc.
  useEffect(() => {
    if (noiseCancellationMode !== 'krisp' || !allowKrispNoiseCancellation) {
      return;
    }
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (!isKrispAuthError(event.reason)) return;
      event.preventDefault();
      event.stopPropagation();
      setLastErrorRef.current(KRISP_AUTH_ERROR_MESSAGE);
      setStoreModeRef.current('webrtc');
      krispProcessorRef.current = null;
      const track = resolvedTrackRef.current;
      if (track) {
        track.stopProcessor().catch(() => {});
      }
      trackNoiseCancellationEvent(NOISE_CANCELLATION_EVENTS.APPLY_FAILED, {
        reason: event.reason instanceof Error ? event.reason.message : String(event.reason),
      });
      trackNoiseCancellationEvent(NOISE_CANCELLATION_EVENTS.FALLBACK_TO_WEBRTC);
    };
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', onUnhandledRejection);
  }, [noiseCancellationMode, allowKrispNoiseCancellation]);

  useEffect(() => {
    if (krispSupportCheckedRef.current || !allowKrispNoiseCancellation) {
      if (allowKrispNoiseCancellation && isKrispSupported === null) {
        setIsKrispSupported(false);
      }
      return;
    }
    krispSupportCheckedRef.current = true;
    loadKrispSupport().then(setIsKrispSupported);
  }, [allowKrispNoiseCancellation, isKrispSupported]);

  const applyMode = useCallback(
    async (track: LocalAudioTrack, enabled: boolean, mode: NoiseCancellationMode) => {
      setLastError(null);
      setIsApplying(true);
      try {
        if (!enabled || mode === 'off') {
          try {
            await track.stopProcessor();
          } catch {
            // ignore
          }
          krispProcessorRef.current = null;
          return 'off' as const;
        }
        if (mode === 'webrtc') {
          try {
            await track.stopProcessor();
          } catch {
            // ignore
          }
          krispProcessorRef.current = null;
          return 'webrtc' as const;
        }
        if (mode === 'krisp') {
          const supported = await loadKrispSupport();
          if (!supported) {
            trackNoiseCancellationEvent(NOISE_CANCELLATION_EVENTS.KRISP_UNSUPPORTED_BROWSER);
            setStoreModeRef.current('webrtc');
            try {
              await track.stopProcessor();
            } catch {
              // ignore
            }
            krispProcessorRef.current = null;
            trackNoiseCancellationEvent(NOISE_CANCELLATION_EVENTS.FALLBACK_TO_WEBRTC);
            return 'webrtc' as const;
          }
          let processor = krispProcessorRef.current;
          if (!processor) {
            const created = await createKrispProcessor();
            if (!created) {
              setLastError('Krisp недоступен');
              trackNoiseCancellationEvent(NOISE_CANCELLATION_EVENTS.APPLY_FAILED, {
                reason: 'processor_create_failed',
              });
              setStoreModeRef.current('webrtc');
              trackNoiseCancellationEvent(NOISE_CANCELLATION_EVENTS.FALLBACK_TO_WEBRTC);
              return 'webrtc' as const;
            }
            processor = created;
            krispProcessorRef.current = processor;
            await track.setProcessor(
              created as unknown as Parameters<LocalAudioTrack['setProcessor']>[0],
            );
          }
          await processor.setEnabled(true);
          return 'krisp' as const;
        }
        return 'webrtc' as const;
      } catch (err) {
        const message = isKrispAuthError(err)
          ? KRISP_AUTH_ERROR_MESSAGE
          : err instanceof Error
            ? err.message
            : String(err);
        setLastError(message);
        trackNoiseCancellationEvent(NOISE_CANCELLATION_EVENTS.APPLY_FAILED, {
          reason: err instanceof Error ? err.message : String(err),
        });
        try {
          await track.stopProcessor();
        } catch {
          // ignore
        }
        krispProcessorRef.current = null;
        if (mode === 'krisp') {
          setStoreModeRef.current('webrtc');
          trackNoiseCancellationEvent(NOISE_CANCELLATION_EVENTS.FALLBACK_TO_WEBRTC);
        }
        return mode === 'krisp' ? ('webrtc' as const) : (mode as 'off' | 'webrtc');
      } finally {
        setIsApplying(false);
      }
    },
    [],
  );

  const [effectiveMode, setEffectiveModeState] = useState<NoiseCancellationMode>(
    noiseCancellationEnabled && noiseCancellationMode !== 'off' ? noiseCancellationMode : 'off',
  );

  useEffect(() => {
    if (!noiseCancellationFeatureEnabled || !resolvedTrack) {
      return;
    }
    if (previousTrackRef.current !== resolvedTrack) {
      krispProcessorRef.current = null;
      previousTrackRef.current = resolvedTrack;
    }
    const enabled = noiseCancellationEnabled && noiseCancellationMode !== 'off';
    const modeToApply = enabled ? noiseCancellationMode : 'off';
    applyMode(resolvedTrack, enabled, modeToApply).then((effective) => {
      setEffectiveModeState(effective);
    });
  }, [resolvedTrack, noiseCancellationEnabled, noiseCancellationMode, applyMode]);

  const setEnabled = useCallback(
    (enabled: boolean) => {
      setStoreEnabled(enabled);
      trackNoiseCancellationEvent(NOISE_CANCELLATION_EVENTS.MODE_CHANGED, {
        enabled: String(enabled),
        mode: noiseCancellationMode,
      });
    },
    [setStoreEnabled, noiseCancellationMode],
  );

  const setMode = useCallback(
    (mode: NoiseCancellationMode) => {
      setStoreMode(mode);
      trackNoiseCancellationEvent(NOISE_CANCELLATION_EVENTS.MODE_CHANGED, {
        enabled: String(noiseCancellationEnabled),
        mode,
      });
    },
    [setStoreMode, noiseCancellationEnabled],
  );

  return {
    isEnabled: noiseCancellationEnabled,
    mode: noiseCancellationMode,
    effectiveMode: effectiveMode,
    setEnabled,
    setMode,
    isApplying,
    isKrispSupported,
    lastError,
    allowKrisp: allowKrispNoiseCancellation,
  };
}
