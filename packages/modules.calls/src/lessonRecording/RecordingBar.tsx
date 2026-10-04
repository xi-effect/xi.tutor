import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatRecordingClock } from './filename';
import type { LessonRecordingFailureReason } from './types';

function useElapsed(startedAt: number | null, running: boolean): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running || startedAt == null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [running, startedAt]);

  if (!running || startedAt == null) return 0;
  return Math.max(0, Math.round((now - startedAt) / 1000));
}

const ERROR_KEYS: Partial<Record<LessonRecordingFailureReason, string>> = {
  capture_denied: 'captureDenied',
  capture_unsupported: 'unsupported',
  desktop_rejected: 'desktopRejected',
  conference_unavailable: 'conferenceUnavailable',
};

type RecordingBarProps = {
  mode: 'start' | 'recording' | 'student';
  startedAt?: number | null;
  busy?: boolean;
  error?: LessonRecordingFailureReason | null;
  onStart?: () => void;
  onStop?: () => void;
};

export function RecordingBar({
  mode,
  startedAt = null,
  busy = false,
  error = null,
  onStart,
  onStop,
}: RecordingBarProps) {
  const { t } = useTranslation('lessonRecording');
  const elapsed = useElapsed(startedAt, mode === 'recording');
  const errorKey = error ? ERROR_KEYS[error] : undefined;

  return (
    <div className="pointer-events-none fixed top-3 left-1/2 z-[210] flex -translate-x-1/2 flex-col items-center gap-2">
      <div className="bg-background-surface border-border-default pointer-events-auto flex items-center gap-3 rounded-2xl border px-3 py-2 shadow-lg">
        {mode === 'start' ? (
          <button
            type="button"
            onClick={onStart}
            disabled={busy}
            className="text-text-primary hover:bg-background-page rounded-xl px-3 py-1.5 text-sm font-medium disabled:opacity-60"
          >
            {t('start')}
          </button>
        ) : null}

        {mode === 'recording' ? (
          <>
            <span className="flex items-center gap-2 text-sm font-medium" aria-live="polite">
              <span className="relative flex size-2.5" aria-hidden>
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-70" />
                <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
              </span>
              {t('recording')} · {formatRecordingClock(elapsed)}
            </span>
            <button
              type="button"
              onClick={onStop}
              disabled={busy}
              className="rounded-xl bg-red-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {t('stop')}
            </button>
          </>
        ) : null}

        {mode === 'student' ? (
          <span className="flex items-center gap-2 text-sm font-medium">
            <span className="relative flex size-2.5" aria-hidden>
              <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
            </span>
            {t('student')}
          </span>
        ) : null}
      </div>
      {errorKey ? (
        <p className="bg-background-surface border-border-default text-text-primary pointer-events-auto rounded-xl border px-3 py-1.5 text-xs shadow-lg">
          {t(errorKey)}
        </p>
      ) : null}
    </div>
  );
}
