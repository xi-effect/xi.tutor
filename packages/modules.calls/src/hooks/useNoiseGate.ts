import { useEffect, useRef } from 'react';
import { useLocalParticipant } from '@livekit/components-react';
import type { LocalAudioTrack } from 'livekit-client';
import { useUserChoicesStore } from '../store/userChoices';

/**
 * Границы RMS-шкалы. Совпадают с SoundAndVideo.tsx —
 * при изменении нужно обновлять оба файла.
 */
const RMS_FLOOR = 0.002;
const RMS_CEIL = 0.3;
const LOG_RANGE = Math.log(RMS_CEIL / RMS_FLOOR);

function sliderToRms(slider: number): number {
  if (slider <= 0) return 0;
  return RMS_FLOOR * Math.exp(slider * LOG_RANGE);
}

type GateState = 'closed' | 'open' | 'holding';

/**
 * Noise gate для микрофона в LiveKit-звонке.
 *
 * Два ключевых момента:
 *
 * 1. audioTrack.mediaStreamTrack — это ГЕТТЕР, который может
 *    возвращать разные объекты MediaStreamTrack при смене
 *    процессоров (Krisp), устройства или реконнекте. Поэтому
 *    нельзя захватывать ссылку один раз — нужно перечитывать
 *    на каждом тике.
 *
 * 2. Analyser подключён к КЛОНУ текущего трека. Клон всегда
 *    active и отдаёт реальный звук с микрофона, даже когда
 *    оригинал отключён через enabled=false. При смене
 *    underlying-трека клон пересоздаётся автоматически.
 *
 * State machine:
 *   CLOSED  → (rms ≥ openThreshold за MIN_OPEN_MS мс)  → OPEN
 *   OPEN    → (rms < closeThreshold)                     → HOLDING
 *   HOLDING → (rms ≥ closeThreshold)                     → OPEN
 *   HOLDING → (hold timer ≥ HOLD_MS)                     → CLOSED
 *
 * Hysteresis: closeThreshold = openThreshold × 0.75
 */
export function useNoiseGate() {
  const threshold = useUserChoicesStore((s) => s.micInputSensitivity) ?? 0;
  const { microphoneTrack } = useLocalParticipant();
  const audioTrack = microphoneTrack?.track as LocalAudioTrack | undefined;

  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!audioTrack || threshold <= 0) return;

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;

    let monitorTrack: MediaStreamTrack | null = null;
    let monitorSource: MediaStreamAudioSourceNode | null = null;
    let trackedTrackId = '';

    const timeDomain = new Float32Array(analyser.fftSize);

    const HOLD_MS = 600;
    const MIN_OPEN_MS = 20;
    const HYSTERESIS = 0.75;

    const gateThreshold = sliderToRms(threshold);
    const openThreshold = gateThreshold;
    const closeThreshold = gateThreshold * HYSTERESIS;

    let state: GateState = 'closed';
    let aboveSince = 0;
    let belowSince = 0;

    const initialTrack = audioTrack.mediaStreamTrack;
    if (initialTrack) {
      trackedTrackId = initialTrack.id;
      monitorTrack = initialTrack.clone();
      monitorTrack.enabled = true;
      initialTrack.enabled = false;
      monitorSource = ctx.createMediaStreamSource(new MediaStream([monitorTrack]));
      monitorSource.connect(analyser);
    }

    intervalRef.current = setInterval(() => {
      const msTrack = audioTrack.mediaStreamTrack;
      if (!msTrack) return;

      if (msTrack.id !== trackedTrackId) {
        monitorSource?.disconnect();
        monitorTrack?.stop();
        monitorTrack = msTrack.clone();
        monitorTrack.enabled = true;
        trackedTrackId = msTrack.id;
        monitorSource = ctx.createMediaStreamSource(new MediaStream([monitorTrack]));
        monitorSource.connect(analyser);
        msTrack.enabled = false;
        state = 'closed';
        aboveSince = 0;
        belowSince = 0;
      }

      const now = performance.now();

      analyser.getFloatTimeDomainData(timeDomain);
      let sum = 0;
      for (let i = 0; i < timeDomain.length; i++) {
        sum += timeDomain[i] * timeDomain[i];
      }
      const rms = Math.sqrt(sum / timeDomain.length);

      switch (state) {
        case 'closed':
          if (rms >= openThreshold) {
            if (aboveSince === 0) aboveSince = now;
            if (now - aboveSince >= MIN_OPEN_MS) {
              msTrack.enabled = true;
              state = 'open';
              aboveSince = 0;
            }
          } else {
            aboveSince = 0;
          }
          break;

        case 'open':
          if (rms < closeThreshold) {
            state = 'holding';
            belowSince = now;
          }
          break;

        case 'holding':
          if (rms >= closeThreshold) {
            state = 'open';
            belowSince = 0;
          } else if (now - belowSince >= HOLD_MS) {
            msTrack.enabled = false;
            state = 'closed';
            belowSince = 0;
          }
          break;
      }
    }, 10);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      monitorTrack?.stop();
      monitorSource?.disconnect();
      ctx.close();
      ctxRef.current = null;
      const msTrack = audioTrack.mediaStreamTrack;
      if (msTrack) msTrack.enabled = true;
    };
  }, [audioTrack, threshold]);
}
