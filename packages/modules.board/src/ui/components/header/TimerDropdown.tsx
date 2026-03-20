import { Button } from '@xipkg/button';
import { Close, Minus, Plus, Redo } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useCurrentUser } from 'common.services';
import {
  type Dispatch,
  type MouseEvent as ReactMouseEvent,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { stopEvent } from '../../../shapes/audio/constants';
import { useYjsContext } from '../../../providers/YjsProvider';
import {
  playBoardTimerEndSound,
  playBoardTimerWarnSound,
  unlockBoardTimerAudio,
} from './boardTimerAudio';

const DEFAULT_DURATION_MS = 5 * 60 * 1000;
const MAX_DURATION_MS = 99 * 60 * 1000 + 59 * 1000;

const TIMER_KEYS = {
  baseMs: 'baseMs',
  remainingMs: 'remainingMs',
  isRunning: 'isRunning',
  endsAtMs: 'endsAtMs',
} as const;

const WARN_BEFORE_END_MS = 45_000;

const PANEL_SHAKE_MS = 420;

const clampMs = (value: number) => Math.max(0, Math.min(MAX_DURATION_MS, value));

const formatTwo = (value: number) => String(value).padStart(2, '0');

const parseFieldValue = (value: string, max: number) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(parsed, max);
};

const normalizeMaskInput = (value: string) => value.replace(/\D/g, '').slice(0, 2);
const TIMER_VALUE_CLASS =
  'text-[18px] lg:text-[24px] leading-[1] font-medium tabular-nums font-sans';

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

type TimerDropdownProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

export const TimerDropdown = ({ open, setOpen }: TimerDropdownProps) => {
  const { timerMap } = useYjsContext();
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const panelRef = useRef<HTMLDivElement | null>(null);

  const runPanelShake = useCallback(() => {
    const el = panelRef.current;
    if (!el) return;
    try {
      el.getAnimations?.().forEach((a) => a.cancel());
      el.animate(
        [
          { transform: 'translate3d(0,0,0)' },
          { transform: 'translate3d(-6px,0,0)' },
          { transform: 'translate3d(6px,0,0)' },
          { transform: 'translate3d(-4px,0,0)' },
          { transform: 'translate3d(4px,0,0)' },
          { transform: 'translate3d(-2px,0,0)' },
          { transform: 'translate3d(2px,0,0)' },
          { transform: 'translate3d(0,0,0)' },
        ],
        { duration: PANEL_SHAKE_MS, iterations: 2, easing: 'ease-in-out' },
      );
    } catch {
      /* Web Animations API not supported */
    }
  }, []);

  const [, setTick] = useState(() => Date.now());
  const prevRunningRef = useRef<boolean>(false);
  const played45sWarningRef = useRef(false);
  /** Предыдущий остаток в прогоне — чтобы «45 с» срабатывало только при пересечении порога сверху вниз */
  const lastRemainingFor45sWarnRef = useRef<number | null>(null);
  /** null = ещё не инициализировано (первый тик эффекта) */
  const wasRunningForEndSoundRef = useRef<boolean | null>(null);

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

  /**
   * На паузе интервал не тикает — `tick` в state замирает. Если считать `endsAtMs - tick`,
   * после старта первый кадр даёт гигантский остаток и ложное «пересечение» 45 с.
   * Пока идёт отсчёт — всегда `Date.now()`; ререндеры дают интервал и observer на timerMap.
   */
  const currentRemainingMs = !snapshot.isRunning
    ? snapshot.remainingMs
    : clampMs(snapshot.endsAtMs - Date.now());

  /** Первый клик/тап по странице (доска, UI) — разблокирует звук для ученика и всех без клика по колокольчику */
  useEffect(() => {
    const onFirstPointer = () => {
      unlockBoardTimerAudio();
    };
    window.addEventListener('pointerdown', onFirstPointer, { capture: true, once: true });
    return () => window.removeEventListener('pointerdown', onFirstPointer, { capture: true });
  }, []);

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
      played45sWarningRef.current = false;
      lastRemainingFor45sWarnRef.current = null;
    }
    prevRunningRef.current = snapshot.isRunning;
  }, [setOpen, snapshot.isRunning]);

  /**
   * За 45 с до конца: только если таймер реально «вошёл» в последние 45 с (было > 45 с, стало ≤ 45 с).
   * Если стартовали с 30 с — порог не пересекается, уведомление не играем.
   * Сброс флага, если снова стало > 45 с (+время на ходу).
   */
  useEffect(() => {
    if (!snapshot.isRunning) {
      lastRemainingFor45sWarnRef.current = null;
      return;
    }

    const prev = lastRemainingFor45sWarnRef.current;

    if (currentRemainingMs > WARN_BEFORE_END_MS) {
      played45sWarningRef.current = false;
      lastRemainingFor45sWarnRef.current = currentRemainingMs;
      return;
    }

    if (
      currentRemainingMs > 0 &&
      prev !== null &&
      prev > WARN_BEFORE_END_MS &&
      !played45sWarningRef.current
    ) {
      played45sWarningRef.current = true;
      playBoardTimerWarnSound();
      requestAnimationFrame(() => runPanelShake());
    }

    lastRemainingFor45sWarnRef.current = currentRemainingMs;
  }, [currentRemainingMs, runPanelShake, snapshot.isRunning]);

  /** Окончание отсчёта: переход running → stopped при остатке 0 */
  useEffect(() => {
    if (wasRunningForEndSoundRef.current === null) {
      wasRunningForEndSoundRef.current = snapshot.isRunning;
      return;
    }

    const wasRunning = wasRunningForEndSoundRef.current;
    wasRunningForEndSoundRef.current = snapshot.isRunning;

    if (wasRunning && !snapshot.isRunning && snapshot.remainingMs === 0) {
      playBoardTimerEndSound();
      requestAnimationFrame(() => runPanelShake());
    }
  }, [runPanelShake, snapshot.isRunning, snapshot.remainingMs]);

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

  const onControlClick = (e: ReactMouseEvent<HTMLButtonElement>, handler: () => void) => {
    e.stopPropagation();
    unlockBoardTimerAudio();
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

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="bg-gray-0 border-gray-10 pointer-events-auto rounded-xl border p-1 will-change-transform lg:rounded-2xl"
      onPointerDownCapture={() => unlockBoardTimerAudio()}
    >
      <div className="flex items-center justify-center gap-2">
        {snapshot.isRunning ? (
          <div className={cn('flex items-center justify-center gap-1 px-2', TIMER_VALUE_CLASS)}>
            <div
              className={cn(
                'w-8 bg-transparent p-0 text-center outline-none select-none',
                TIMER_VALUE_CLASS,
              )}
            >
              {formatTwo(minutes)}
            </div>
            <span className={TIMER_VALUE_CLASS}>:</span>
            <div
              className={cn(
                'w-8 bg-transparent p-0 text-center outline-none select-none',
                TIMER_VALUE_CLASS,
              )}
            >
              {formatTwo(seconds)}
            </div>
          </div>
        ) : (
          <div className={cn('flex items-center justify-center gap-1 px-2', TIMER_VALUE_CLASS)}>
            <input
              value={fields.minutes}
              onChange={(e) => handleMinutesChange(e.target.value)}
              onBlur={() => updatePausedValue(fields.minutes, fields.seconds)}
              disabled={!isTutor}
              className={cn(
                'w-8 bg-transparent p-0 text-center outline-none placeholder:text-current',
                TIMER_VALUE_CLASS,
              )}
              inputMode="numeric"
              maxLength={2}
              placeholder="--"
              onPointerDown={stopEvent}
            />
            <span className={TIMER_VALUE_CLASS}>:</span>
            <input
              value={fields.seconds}
              onChange={(e) => handleSecondsChange(e.target.value)}
              onBlur={() => updatePausedValue(fields.minutes, fields.seconds)}
              disabled={!isTutor}
              className={cn(
                'w-8 bg-transparent p-0 text-center outline-none placeholder:text-current',
                TIMER_VALUE_CLASS,
              )}
              inputMode="numeric"
              maxLength={2}
              placeholder="--"
              onPointerDown={stopEvent}
            />
          </div>
        )}

        {isTutor && (
          <>
            {snapshot.isRunning ? (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs-base-size h-6 w-8 rounded-lg p-0 lg:h-8 lg:w-10 lg:rounded-xl"
                  onPointerDown={stopEvent}
                  onClick={(e) => onControlClick(e, () => shiftRunningBy(15_000))}
                >
                  +15с
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs-base-size h-6 w-8 rounded-lg p-0 lg:h-8 lg:w-10 lg:rounded-xl"
                  onPointerDown={stopEvent}
                  onClick={(e) => onControlClick(e, () => shiftRunningBy(60_000))}
                >
                  +1м
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  className="h-6 w-8 rounded-lg p-0 lg:h-8 lg:w-10 lg:rounded-xl"
                  onPointerDown={stopEvent}
                  onClick={(e) => onControlClick(e, () => shiftPausedBy(30_000))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-6 w-8 rounded-lg p-0 lg:h-8 lg:w-10 lg:rounded-xl"
                  onPointerDown={stopEvent}
                  onClick={(e) => onControlClick(e, () => shiftPausedBy(-30_000))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="bg-gray-10 h-6 w-px shrink-0 lg:h-8" />

            <Button
              type="button"
              variant="none"
              className="bg-brand-80 hover:bg-brand-100 focus:bg-brand-100 active:bg-brand-100 disabled:bg-gray-40 flex h-6 w-6 shrink-0 items-center justify-center rounded-full p-0 lg:h-8 lg:w-8"
              onPointerDown={stopEvent}
              onClick={(e) => onControlClick(e, snapshot.isRunning ? handlePause : handlePlay)}
              disabled={!snapshot.isRunning && snapshot.remainingMs <= 0}
              data-umami-event={snapshot.isRunning ? 'board-timer-pause' : 'board-timer-play'}
              title={snapshot.isRunning ? 'Пауза' : 'Старт'}
            >
              <PlayPauseIcon isPlaying={snapshot.isRunning} />
            </Button>
            <Button
              type="button"
              variant="none"
              className="bg-gray-5 hover:bg-gray-10 focus:bg-gray-10 active:bg-gray-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full p-0 lg:h-8 lg:w-8"
              onPointerDown={stopEvent}
              onClick={(e) => onControlClick(e, handleReset)}
              data-umami-event="board-timer-reset"
              title="Сброс"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </>
        )}

        <div className="bg-gray-10 h-6 w-px shrink-0 lg:h-8" />
        <Button
          type="button"
          variant="none"
          className="bg-gray-5 hover:bg-gray-10 focus:bg-gray-10 active:bg-gray-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full p-0 lg:h-8 lg:w-8"
          onPointerDown={stopEvent}
          onClick={(e) =>
            onControlClick(e, () => {
              setOpen(false);
            })
          }
          data-umami-event="board-timer-close"
          title="Закрыть таймер"
        >
          <Close className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
