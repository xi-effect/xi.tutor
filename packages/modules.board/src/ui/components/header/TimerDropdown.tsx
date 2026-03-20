import { Button } from '@xipkg/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@xipkg/dropdown';
import { AlarmClock, Minus, Plus, Redo } from '@xipkg/icons';
import { useCurrentUser } from 'common.services';
import { type MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { stopEvent } from '../../../shapes/audio/constants';
import { useYjsContext } from '../../../providers/YjsProvider';

const DEFAULT_DURATION_MS = 5 * 60 * 1000;
const MAX_DURATION_MS = 99 * 60 * 1000 + 59 * 1000;

const TIMER_KEYS = {
  baseMs: 'baseMs',
  remainingMs: 'remainingMs',
  isRunning: 'isRunning',
  endsAtMs: 'endsAtMs',
} as const;

const clampMs = (value: number) => Math.max(0, Math.min(MAX_DURATION_MS, value));

const formatTwo = (value: number) => String(value).padStart(2, '0');

const parseFieldValue = (value: string, max: number) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(parsed, max);
};

const normalizeMaskInput = (value: string) => value.replace(/\D/g, '').slice(0, 2);

const PlayPauseIcon = ({ isPlaying }: { isPlaying: boolean }) => {
  if (isPlaying) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="white" aria-hidden>
        <rect x="3" y="2" width="4" height="12" rx="1" />
        <rect x="9" y="2" width="4" height="12" rx="1" />
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="white" aria-hidden>
      <path d="M4.5 2v12l9-6-9-6z" />
    </svg>
  );
};

export const TimerDropdown = () => {
  const { timerMap } = useYjsContext();
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(() => Date.now());
  const prevRunningRef = useRef<boolean>(false);

  const [fields, setFields] = useState({ minutes: '05', seconds: '00' });

  const snapshot = (() => {
    const baseMs = Number(timerMap.get(TIMER_KEYS.baseMs) ?? DEFAULT_DURATION_MS);
    const remainingMs = Number(timerMap.get(TIMER_KEYS.remainingMs) ?? baseMs);
    const isRunning = Boolean(timerMap.get(TIMER_KEYS.isRunning) ?? false);
    const endsAtMs = Number(timerMap.get(TIMER_KEYS.endsAtMs) ?? 0);

    const safeBaseMs = clampMs(baseMs);
    const safeRemainingMs = clampMs(remainingMs);

    return {
      baseMs: safeBaseMs,
      remainingMs: safeRemainingMs,
      isRunning,
      endsAtMs,
    };
  })();

  const currentRemainingMs = useMemo(() => {
    if (!snapshot.isRunning) return snapshot.remainingMs;
    return clampMs(snapshot.endsAtMs - tick);
  }, [snapshot, tick]);

  useEffect(() => {
    if (timerMap.has(TIMER_KEYS.baseMs)) return;

    timerMap.doc?.transact(() => {
      timerMap.set(TIMER_KEYS.baseMs, DEFAULT_DURATION_MS);
      timerMap.set(TIMER_KEYS.remainingMs, DEFAULT_DURATION_MS);
      timerMap.set(TIMER_KEYS.isRunning, false);
      timerMap.set(TIMER_KEYS.endsAtMs, 0);
    }, 'timer-init');
  }, [timerMap]);

  useEffect(() => {
    const observer = () => setTick(Date.now());
    timerMap.observe(observer);
    return () => timerMap.unobserve(observer);
  }, [timerMap]);

  useEffect(() => {
    if (!snapshot.isRunning) return;

    const interval = window.setInterval(() => {
      setTick(Date.now());
    }, 250);

    return () => window.clearInterval(interval);
  }, [snapshot.isRunning]);

  useEffect(() => {
    if (snapshot.isRunning && !prevRunningRef.current) {
      setOpen(true);
    }
    prevRunningRef.current = snapshot.isRunning;
  }, [snapshot.isRunning]);

  useEffect(() => {
    if (snapshot.isRunning) return;

    const totalSeconds = Math.floor(currentRemainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    setFields({
      minutes: formatTwo(minutes),
      seconds: formatTwo(seconds),
    });
  }, [snapshot.isRunning, currentRemainingMs]);

  useEffect(() => {
    if (!isTutor || !snapshot.isRunning || currentRemainingMs > 0) return;

    timerMap.doc?.transact(() => {
      timerMap.set(TIMER_KEYS.isRunning, false);
      timerMap.set(TIMER_KEYS.remainingMs, 0);
      timerMap.set(TIMER_KEYS.endsAtMs, 0);
    }, 'timer-finish');
  }, [currentRemainingMs, isTutor, snapshot.isRunning, timerMap]);

  const updatePausedValue = (minutesValue: string, secondsValue: string) => {
    if (!isTutor) return;

    const minutes = parseFieldValue(minutesValue, 99);
    const seconds = parseFieldValue(secondsValue, 59);
    const nextMs = clampMs((minutes * 60 + seconds) * 1000);

    timerMap.doc?.transact(() => {
      timerMap.set(TIMER_KEYS.baseMs, nextMs);
      timerMap.set(TIMER_KEYS.remainingMs, nextMs);
      timerMap.set(TIMER_KEYS.isRunning, false);
      timerMap.set(TIMER_KEYS.endsAtMs, 0);
    }, 'timer-set');
  };

  const handleMinutesChange = (value: string) => {
    const masked = normalizeMaskInput(value);
    setFields((prev) => ({ ...prev, minutes: masked }));
  };

  const handleSecondsChange = (value: string) => {
    const masked = normalizeMaskInput(value);
    setFields((prev) => ({ ...prev, seconds: masked }));
  };

  const onControlClick = (e: MouseEvent<HTMLButtonElement>, handler: () => void) => {
    e.stopPropagation();
    handler();
  };

  const shiftPausedBy = (deltaMs: number) => {
    if (!isTutor || snapshot.isRunning) return;
    const next = clampMs(snapshot.remainingMs + deltaMs);

    timerMap.doc?.transact(() => {
      timerMap.set(TIMER_KEYS.baseMs, next);
      timerMap.set(TIMER_KEYS.remainingMs, next);
      timerMap.set(TIMER_KEYS.endsAtMs, 0);
    }, 'timer-shift-paused');
  };

  const shiftRunningBy = (deltaMs: number) => {
    if (!isTutor || !snapshot.isRunning) return;
    const nextRemaining = clampMs(currentRemainingMs + deltaMs);
    const nextEndsAt = Date.now() + nextRemaining;

    timerMap.doc?.transact(() => {
      timerMap.set(TIMER_KEYS.endsAtMs, nextEndsAt);
      timerMap.set(TIMER_KEYS.remainingMs, nextRemaining);
    }, 'timer-shift-running');
  };

  const handlePlay = () => {
    if (!isTutor) return;
    const remaining = snapshot.remainingMs > 0 ? snapshot.remainingMs : snapshot.baseMs;
    const safeRemaining = clampMs(remaining);

    timerMap.doc?.transact(() => {
      timerMap.set(TIMER_KEYS.isRunning, true);
      timerMap.set(TIMER_KEYS.remainingMs, safeRemaining);
      timerMap.set(TIMER_KEYS.endsAtMs, Date.now() + safeRemaining);
    }, 'timer-play');
  };

  const handlePause = () => {
    if (!isTutor) return;
    const remaining = clampMs(snapshot.endsAtMs - Date.now());

    timerMap.doc?.transact(() => {
      timerMap.set(TIMER_KEYS.isRunning, false);
      timerMap.set(TIMER_KEYS.remainingMs, remaining);
      timerMap.set(TIMER_KEYS.endsAtMs, 0);
    }, 'timer-pause');
  };

  const handleReset = () => {
    if (!isTutor) return;

    timerMap.doc?.transact(() => {
      timerMap.set(TIMER_KEYS.isRunning, false);
      timerMap.set(TIMER_KEYS.remainingMs, snapshot.baseMs);
      timerMap.set(TIMER_KEYS.endsAtMs, 0);
    }, 'timer-reset');
  };

  const totalSeconds = Math.floor(currentRemainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="none"
          className="hover:bg-brand-0 flex h-6 w-6 items-center justify-center rounded-lg p-0 focus:bg-transparent lg:h-8 lg:w-8 lg:rounded-xl"
          data-umami-event="board-timer-menu"
        >
          <AlarmClock size="s" className="h-4 w-4 lg:h-6 lg:w-6" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="z-100 rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-1 items-center gap-3">
            {snapshot.isRunning ? (
              <div className="text-[48px] leading-[0.95] font-medium tabular-nums select-none">
                {formatTwo(minutes)} : {formatTwo(seconds)}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[48px] leading-[0.95] font-medium tabular-nums">
                <input
                  value={fields.minutes}
                  onChange={(e) => handleMinutesChange(e.target.value)}
                  onBlur={() => updatePausedValue(fields.minutes, fields.seconds)}
                  disabled={!isTutor}
                  className="h-16 w-20 bg-transparent p-0 text-center text-[48px] leading-[0.95] outline-none"
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="--"
                  onPointerDown={stopEvent}
                />
                <span>:</span>
                <input
                  value={fields.seconds}
                  onChange={(e) => handleSecondsChange(e.target.value)}
                  onBlur={() => updatePausedValue(fields.minutes, fields.seconds)}
                  disabled={!isTutor}
                  className="h-16 w-20 bg-transparent p-0 text-center text-[48px] leading-[0.95] outline-none"
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="--"
                  onPointerDown={stopEvent}
                />
              </div>
            )}

            {snapshot.isRunning ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl px-3"
                  onPointerDown={stopEvent}
                  onClick={(e) => onControlClick(e, () => shiftRunningBy(15_000))}
                  disabled={!isTutor}
                >
                  +15с
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl px-3"
                  onPointerDown={stopEvent}
                  onClick={(e) => onControlClick(e, () => shiftRunningBy(60_000))}
                  disabled={!isTutor}
                >
                  +1м
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 w-8 rounded-full p-0"
                  onPointerDown={stopEvent}
                  onClick={(e) => onControlClick(e, () => shiftPausedBy(30_000))}
                  disabled={!isTutor}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 w-8 rounded-full p-0"
                  onPointerDown={stopEvent}
                  onClick={(e) => onControlClick(e, () => shiftPausedBy(-30_000))}
                  disabled={!isTutor}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="bg-gray-10 h-20 w-px shrink-0" />

          <div className="flex flex-col items-center gap-2">
            <Button
              type="button"
              variant="none"
              className="bg-brand-80 hover:bg-brand-100 focus:bg-brand-100 active:bg-brand-100 disabled:bg-gray-40 flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-0"
              onPointerDown={stopEvent}
              onClick={(e) => onControlClick(e, snapshot.isRunning ? handlePause : handlePlay)}
              disabled={!isTutor || (!snapshot.isRunning && snapshot.remainingMs <= 0)}
              data-umami-event={snapshot.isRunning ? 'board-timer-pause' : 'board-timer-play'}
              title={snapshot.isRunning ? 'Пауза' : 'Старт'}
            >
              <PlayPauseIcon isPlaying={snapshot.isRunning} />
            </Button>
            <Button
              type="button"
              variant="none"
              className="bg-gray-5 hover:bg-gray-10 focus:bg-gray-10 active:bg-gray-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-0"
              onPointerDown={stopEvent}
              onClick={(e) => onControlClick(e, handleReset)}
              disabled={!isTutor}
              data-umami-event="board-timer-reset"
              title="Сброс"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
