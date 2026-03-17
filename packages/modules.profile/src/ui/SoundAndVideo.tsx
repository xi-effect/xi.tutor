import { useState, useEffect, useRef, useCallback } from 'react';
import { useMediaQuery } from '@xipkg/utils';
import { Button } from '@xipkg/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@xipkg/select';
import { Microphone, SoundTwo, SoundOn, Soundoff } from '@xipkg/icons';
import { useUserChoicesStore, type LocalUserChoices } from 'modules.calls';

// --- Аудио-утилиты ---

/**
 * Границы RMS-шкалы для логарифмического маппинга.
 * Ниже RMS_FLOOR → display 0, выше RMS_CEIL → display 1.
 *
 * Эти же константы дублируются в useNoiseGate.ts —
 * при изменении нужно обновлять оба файла.
 */
const RMS_FLOOR = 0.002;
const RMS_CEIL = 0.3;
const LOG_RANGE = Math.log(RMS_CEIL / RMS_FLOOR);

function computeRMS(data: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i];
  }
  return Math.sqrt(sum / data.length);
}

/** RMS → display 0..1, логарифмическая шкала (обратная к sliderToRms). */
function rmsToDisplay(rms: number): number {
  if (rms <= RMS_FLOOR) return 0;
  if (rms >= RMS_CEIL) return 1;
  return Math.log(rms / RMS_FLOOR) / LOG_RANGE;
}

/** Slider position 0..1 → реальный RMS threshold (обратная к rmsToDisplay). */
function sliderToRms(slider: number): number {
  if (slider <= 0) return 0;
  return RMS_FLOOR * Math.exp(slider * LOG_RANGE);
}

// --- Хуки ---

function useAudioDevices() {
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  const enumerate = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter((d) => d.kind === 'audioinput');
      const outputs = devices.filter((d) => d.kind === 'audiooutput');
      setInputDevices(inputs);
      setOutputDevices(outputs);

      if (inputs.length > 0 && inputs[0].label) {
        setPermissionState('granted');
      }
    } catch {
      // devices not available
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermissionState('granted');
      await enumerate();
    } catch {
      setPermissionState('denied');
    }
  }, [enumerate]);

  useEffect(() => {
    enumerate();
    navigator.mediaDevices.addEventListener('devicechange', enumerate);
    return () => navigator.mediaDevices.removeEventListener('devicechange', enumerate);
  }, [enumerate]);

  return { inputDevices, outputDevices, permissionState, requestPermission };
}

type GateState = 'closed' | 'open' | 'holding';

/**
 * Тест микрофона с loopback и noise gate.
 *
 * Аудиограф:
 *   Source → Analyser            (мгновенный RMS, без задержки)
 *   Source → Delay(40ms) → Gate → Destination → <audio>
 *
 * Gate state machine (конечный автомат):
 *   CLOSED  → (rms ≥ openThreshold в течение MIN_OPEN_MS)  → OPEN
 *   OPEN    → (rms < closeThreshold)                        → HOLDING
 *   HOLDING → (rms ≥ closeThreshold)                        → OPEN
 *   HOLDING → (hold timer ≥ HOLD_MS)                        → CLOSED
 *
 * Hysteresis:
 *   openThreshold = sliderToRms(slider)
 *   closeThreshold = openThreshold × 0.75
 *
 * Маппинг:
 *   VU meter: rmsToDisplay(rms) — логарифмическая шкала
 *   Slider:   0..1 → sliderToRms() → реальный RMS threshold
 *   rmsToDisplay(sliderToRms(x)) ≡ x, визуальное соответствие точное.
 *
 * Gate loop работает на setInterval(10ms) — стабильнее RAF для аудиологики.
 */
function useMicrophoneTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [volume, setVolume] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const loopbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTest = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (loopbackAudioRef.current) {
      loopbackAudioRef.current.pause();
      loopbackAudioRef.current.srcObject = null;
      loopbackAudioRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsTesting(false);
    setVolume(0);
  }, []);

  const startTest = useCallback(
    async (inputDeviceId?: string, outputDeviceId?: string) => {
      stopTest();
      try {
        const constraints: MediaStreamConstraints = {
          audio: {
            ...(inputDeviceId && inputDeviceId !== 'default'
              ? { deviceId: { exact: inputDeviceId } }
              : {}),
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        const ctx = new AudioContext();
        if (ctx.state !== 'running') await ctx.resume();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);

        const LOOK_AHEAD = 0.04;
        const delay = ctx.createDelay(LOOK_AHEAD);
        delay.delayTime.value = LOOK_AHEAD;

        const ATTENUATION = 0.01;
        const gateGain = ctx.createGain();
        const initSlider = useUserChoicesStore.getState().micInputSensitivity ?? 0;
        gateGain.gain.value = initSlider > 0 ? ATTENUATION : 1;

        source.connect(delay);
        delay.connect(gateGain);

        const loopbackDest = ctx.createMediaStreamDestination();
        gateGain.connect(loopbackDest);

        const loopbackAudio = new Audio();
        loopbackAudio.srcObject = loopbackDest.stream;
        loopbackAudioRef.current = loopbackAudio;

        if (outputDeviceId && outputDeviceId !== 'default' && 'setSinkId' in loopbackAudio) {
          await (
            loopbackAudio as HTMLAudioElement & { setSinkId: (id: string) => Promise<void> }
          ).setSinkId(outputDeviceId);
        }
        await loopbackAudio.play();

        const ATTACK_SEC = 0.005;
        const RELEASE_SEC = 0.1;
        const MIN_OPEN_MS = 20;
        const HOLD_MS = 200;
        const HYSTERESIS = 0.75;

        let state: GateState = initSlider > 0 ? 'closed' : 'open';
        let aboveSince = 0;
        let belowSince = 0;

        const timeDomain = new Float32Array(analyser.fftSize);

        intervalRef.current = setInterval(() => {
          const now = performance.now();

          analyser.getFloatTimeDomainData(timeDomain);
          const rms = computeRMS(timeDomain);
          setVolume(rmsToDisplay(rms));

          const sliderValue = useUserChoicesStore.getState().micInputSensitivity ?? 0;
          const gateThreshold = sliderToRms(sliderValue);

          if (gateThreshold <= 0) {
            if (state !== 'open') {
              const t = ctx.currentTime;
              gateGain.gain.cancelScheduledValues(t);
              gateGain.gain.setValueAtTime(gateGain.gain.value, t);
              gateGain.gain.linearRampToValueAtTime(1, t + ATTACK_SEC);
              state = 'open';
              aboveSince = 0;
              belowSince = 0;
            }
            return;
          }

          const openThreshold = gateThreshold;
          const closeThreshold = gateThreshold * HYSTERESIS;

          switch (state) {
            case 'closed':
              if (rms >= openThreshold) {
                if (aboveSince === 0) aboveSince = now;
                if (now - aboveSince >= MIN_OPEN_MS) {
                  const t = ctx.currentTime;
                  gateGain.gain.cancelScheduledValues(t);
                  gateGain.gain.setValueAtTime(gateGain.gain.value, t);
                  gateGain.gain.linearRampToValueAtTime(1, t + ATTACK_SEC);
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
                const t = ctx.currentTime;
                gateGain.gain.cancelScheduledValues(t);
                gateGain.gain.setValueAtTime(gateGain.gain.value, t);
                gateGain.gain.linearRampToValueAtTime(ATTENUATION, t + RELEASE_SEC);
                state = 'closed';
                belowSince = 0;
              }
              break;
          }
        }, 10);

        setIsTesting(true);
      } catch {
        // mic not available
      }
    },
    [stopTest],
  );

  useEffect(() => () => stopTest(), [stopTest]);

  return { isTesting, volume, startTest, stopTest };
}

function useSpeakerTest() {
  const [isTesting, setIsTesting] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const startTest = useCallback(async (deviceId?: string) => {
    try {
      setIsTesting(true);

      const audioContext = new AudioContext();
      if (audioContext.state !== 'running') await audioContext.resume();

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = 440;
      gainNode.gain.value = 0.3;

      const dest = audioContext.createMediaStreamDestination();
      oscillator.connect(gainNode);
      gainNode.connect(dest);

      const audio = new Audio();
      audio.srcObject = dest.stream;

      if (deviceId && deviceId !== 'default' && 'setSinkId' in audio) {
        await (audio as HTMLAudioElement & { setSinkId: (id: string) => Promise<void> }).setSinkId(
          deviceId,
        );
      }

      oscillator.start();
      await audio.play();

      const cleanup = () => {
        oscillator.stop();
        audio.pause();
        audio.srcObject = null;
        audioContext.close();
        setIsTesting(false);
      };

      cleanupRef.current = cleanup;
      setTimeout(cleanup, 2000);
    } catch {
      setIsTesting(false);
    }
  }, []);

  useEffect(() => () => cleanupRef.current?.(), []);

  return { isTesting, startTest };
}

// -- UI --

const VolumeBar = ({ value }: { value: number }) => (
  <div className="flex items-center gap-3">
    <Soundoff className="fill-gray-60 h-4 w-4 shrink-0" />
    <div className="bg-gray-10 relative h-2 flex-1 overflow-hidden rounded-full">
      <div
        className="bg-brand-80 absolute inset-y-0 left-0 rounded-full transition-[width] duration-75"
        style={{ width: `${value * 100}%` }}
      />
    </div>
    <SoundOn className="fill-gray-60 h-5 w-5 shrink-0" />
  </div>
);

const MicLevelWithThreshold = ({
  level,
  threshold,
  onThresholdChange,
}: {
  level: number;
  threshold: number;
  onThresholdChange: (value: number) => void;
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updateFromPointer = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      onThresholdChange(ratio);
    },
    [onThresholdChange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updateFromPointer(e.clientX);
    },
    [updateFromPointer],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isDragging.current) updateFromPointer(e.clientX);
    },
    [updateFromPointer],
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div className="flex items-center gap-3">
      <Soundoff className="fill-gray-60 h-4 w-4 shrink-0" />
      <div
        ref={trackRef}
        className="relative flex h-3 flex-1 cursor-pointer items-center"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="bg-gray-10 absolute inset-0 rounded-full" />
        <div
          className="bg-brand-80 absolute inset-y-0 left-0 rounded-full transition-[width] duration-75"
          style={{ width: `${level * 100}%` }}
        />
        <div
          className="bg-gray-60 absolute -top-1 -bottom-1 z-5 w-px -translate-x-1/2"
          style={{ left: `${threshold * 100}%` }}
        />
        <div
          className="border-gray-0 bg-gray-0 absolute top-1/2 z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-md"
          style={{ left: `${threshold * 100}%` }}
        />
      </div>
      <SoundOn className="fill-gray-60 h-5 w-5 shrink-0" />
    </div>
  );
};

export const SoundAndVideo = () => {
  const isMobile = useMediaQuery('(max-width: 719px)');
  const { inputDevices, outputDevices, permissionState, requestPermission } = useAudioDevices();

  const audioDeviceId = useUserChoicesStore((s: LocalUserChoices) => s.audioDeviceId) ?? '';
  const audioOutputDeviceId =
    useUserChoicesStore((s: LocalUserChoices) => s.audioOutputDeviceId) ?? 'default';
  const micInputSensitivity =
    useUserChoicesStore((s: LocalUserChoices) => s.micInputSensitivity) ?? 0;

  const micTest = useMicrophoneTest();
  const speakerTest = useSpeakerTest();

  const handleMicChange = useCallback((deviceId: string) => {
    useUserChoicesStore.setState({ audioDeviceId: deviceId });
  }, []);

  const handleSpeakerChange = useCallback((deviceId: string) => {
    useUserChoicesStore.setState({ audioOutputDeviceId: deviceId });
  }, []);

  const handleSensitivityChange = useCallback((value: number) => {
    useUserChoicesStore.setState({ micInputSensitivity: value });
  }, []);

  const handleMicTest = useCallback(async () => {
    if (micTest.isTesting) {
      micTest.stopTest();
      return;
    }
    if (permissionState !== 'granted') {
      await requestPermission();
    }
    micTest.startTest(audioDeviceId || undefined, audioOutputDeviceId || undefined);
  }, [micTest, permissionState, requestPermission, audioDeviceId, audioOutputDeviceId]);

  const handleSpeakerTest = useCallback(() => {
    if (!speakerTest.isTesting) {
      speakerTest.startTest(audioOutputDeviceId || undefined);
    }
  }, [speakerTest, audioOutputDeviceId]);

  const hasInputDevices = inputDevices.length > 0 && inputDevices[0].deviceId !== '';
  const hasOutputDevices = outputDevices.length > 0 && outputDevices[0].deviceId !== '';

  return (
    <>
      {!isMobile && (
        <h1 className="mb-4 text-3xl font-semibold dark:text-gray-100">Звук и видео</h1>
      )}
      <div className="flex flex-col gap-6 sm:gap-8">
        <div className="border-gray-80 flex w-full flex-col rounded-2xl border p-5">
          <h2 className="mb-6 text-xl font-semibold dark:text-gray-100">Звук</h2>

          <div className="mb-6">
            <span className="mb-2 block text-sm font-semibold dark:text-gray-100">Микрофон</span>
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <Select
                  value={audioDeviceId}
                  onValueChange={handleMicChange}
                  disabled={!hasInputDevices}
                >
                  <SelectTrigger
                    className="w-full"
                    before={
                      <div>
                        <Microphone className="h-4 w-4" />
                      </div>
                    }
                  >
                    <SelectValue placeholder="Встроенный микрофон" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectGroup>
                      {inputDevices.map((device) => (
                        <SelectItem
                          key={device.deviceId}
                          className="h-auto"
                          value={device.deviceId || 'default'}
                        >
                          {device.label || `Микрофон ${device.deviceId.slice(0, 8)}`}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleMicTest}
                variant={micTest.isTesting ? 'secondary' : 'default'}
                className="shrink-0"
              >
                {micTest.isTesting ? 'Остановить' : 'Проверить'}
              </Button>
            </div>
          </div>

          <div className="mb-8">
            <span className="mb-1 block text-sm font-semibold dark:text-gray-100">
              Порог активации микрофона
            </span>
            <span className="text-gray-60 mb-3 block text-xs">
              Установите порог так, чтобы фоновый шум оставался ниже него, а ваш голос — выше.
            </span>
            <MicLevelWithThreshold
              level={micTest.isTesting ? micTest.volume : 0}
              threshold={micInputSensitivity}
              onThresholdChange={handleSensitivityChange}
            />
          </div>

          <hr className="border-gray-10 mb-6" />

          <div className="mb-6">
            <span className="mb-2 block text-sm font-semibold dark:text-gray-100">Динамики</span>
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <Select
                  value={audioOutputDeviceId}
                  onValueChange={handleSpeakerChange}
                  disabled={!hasOutputDevices}
                >
                  <SelectTrigger
                    className="w-full"
                    before={
                      <div>
                        <SoundTwo className="h-4 w-4" />
                      </div>
                    }
                  >
                    <SelectValue placeholder="Встроенные динамики" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectGroup>
                      {outputDevices.map((device) => (
                        <SelectItem
                          key={device.deviceId}
                          className="h-auto"
                          value={device.deviceId || 'default'}
                        >
                          {device.label || `Динамик ${device.deviceId.slice(0, 8)}`}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSpeakerTest}
                variant={speakerTest.isTesting ? 'secondary' : 'default'}
                disabled={speakerTest.isTesting}
                className="shrink-0"
              >
                {speakerTest.isTesting ? 'Воспроизведение...' : 'Проверить'}
              </Button>
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm dark:text-gray-100">Громкость</span>
            <VolumeBar value={speakerTest.isTesting ? 0.5 : 0} />
          </div>
        </div>
      </div>
    </>
  );
};
