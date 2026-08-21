import { useEffect, useRef, useState } from 'react';
import { useLocation, useSearch } from '@tanstack/react-router';
import { cn } from '@xipkg/utils';
import { getInviteProgress } from 'common.utils';
import { useTranslation } from 'react-i18next';

const DISPLAYED_PROGRESS_KEY = 'invite.progress_displayed';

type DisplayedProgress = {
  track: string;
  current: number;
};

type InviteProgressCardProps = {
  isAuthenticated?: boolean;
  className?: string;
  placement?: 'inline' | 'pageTop';
};

const readDisplayedProgress = (): DisplayedProgress | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(DISPLAYED_PROGRESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DisplayedProgress;
    if (parsed && typeof parsed.track === 'string' && typeof parsed.current === 'number') {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
};

const writeDisplayedProgress = (value: DisplayedProgress) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(DISPLAYED_PROGRESS_KEY, JSON.stringify(value));
  } catch {
    // ignore
  }
};

export const InviteProgressCard = ({
  isAuthenticated,
  className,
  placement = 'inline',
}: InviteProgressCardProps) => {
  const { t } = useTranslation('commonUi');
  const location = useLocation();
  const search = useSearch({ strict: false }) as { invite?: string; redirect?: string };
  const progress = getInviteProgress({
    pathname: location.pathname,
    search,
    isAuthenticated,
  });

  const current = progress?.current ?? 0;
  const track = progress?.track;
  const stored = progress ? readDisplayedProgress() : null;
  const initialFilled =
    progress && stored?.track === progress.track ? Math.min(stored.current, progress.current) : 0;

  const fromRef = useRef(initialFilled);
  const [filledCount, setFilledCount] = useState(initialFilled);

  useEffect(() => {
    if (!track || current === 0) return;

    if (fromRef.current > current) {
      fromRef.current = 0;
    }

    const frame = requestAnimationFrame(() => {
      setFilledCount(current);
      writeDisplayedProgress({ track, current });
    });

    return () => {
      cancelAnimationFrame(frame);
      fromRef.current = current;
    };
  }, [current, track]);

  if (!progress) return null;

  const content = (
    <div className={cn('flex w-full min-w-0 flex-col gap-3', className)}>
      <p className="text-text-secondary text-center text-sm text-pretty">
        {t('inviteProgress.hint')}
      </p>
      <div
        className="flex w-full gap-2"
        role="progressbar"
        aria-valuemin={1}
        aria-valuenow={progress.current}
        aria-valuemax={progress.total}
        aria-label={t('inviteProgress.remaining', {
          count: progress.remaining,
          total: progress.total,
        })}
      >
        {Array.from({ length: progress.total }, (_, index) => {
          const filled = index < filledCount;
          const delay = filled ? Math.max(index - fromRef.current, 0) * 80 : 0;

          return (
            <div
              key={index}
              className="bg-background-subtle h-1.5 min-w-0 flex-1 overflow-hidden rounded"
            >
              <div
                className={cn(
                  'bg-action-primary-background-default h-full w-full origin-left rounded',
                  'transition-transform duration-500 ease-out motion-reduce:transition-none',
                )}
                style={{
                  transform: filled ? 'scaleX(1)' : 'scaleX(0)',
                  transitionDelay: `${delay}ms`,
                }}
              />
            </div>
          );
        })}
      </div>
      <p className="text-text-secondary text-center text-sm text-pretty">
        {t('inviteProgress.remaining', {
          count: progress.remaining,
          total: progress.total,
        })}
      </p>
    </div>
  );

  if (placement === 'pageTop') {
    return (
      <div className="bg-background-surface sticky top-0 z-10 w-full shrink-0 px-4 pt-5 pb-3 sm:pt-6">
        <div className="mx-auto w-full max-w-105">{content}</div>
      </div>
    );
  }

  return content;
};
