/**
 * Порог жёсткой перемотки слушателя.
 * Ниже остаются сетевой джиттер и грубый currentTime на iOS, выше — реальный seek.
 */
export const SYNC_HARD_SEEK_SEC = 0.6;

/** Дальше этого экстраполировать позицию по часам нельзя: часы телефонов врут. */
export const SYNC_MAX_EXTRAPOLATION_SEC = 2.5;

/** Запись «играет» старше этой паузы — это хвост прошлого урока, не живой эфир. */
export const SYNC_STALE_MS = 60_000;

export const SYNC_HEARTBEAT_MS = 2_000;

/** Оценка «часы отправителя − наши часы», по пакету с наименьшей сетевой задержкой. */
export function updateClockOffset(
  previous: number | null,
  localNow: number,
  remoteTs: number,
): number {
  const sample = remoteTs - localNow;
  if (!Number.isFinite(sample)) return previous ?? 0;
  if (previous === null || !Number.isFinite(previous)) return sample;
  if (sample > previous + 5_000) return sample;
  return Math.max(previous, sample);
}

export type RemoteAudioSync = {
  playing: boolean;
  time: number;
  ts: number;
};

export type LocalAudioSync = {
  currentTime: number;
  duration: number;
  paused: boolean;
};

export type SyncPlan = { kind: 'pause'; time: number } | { kind: 'play'; seekTo: number | null };

export function clampPlaybackTime(time: number, duration: number): number {
  const safe = Number.isFinite(time) ? Math.max(0, time) : 0;
  if (!Number.isFinite(duration) || duration <= 0) return safe;
  return Math.min(duration, safe);
}

/**
 * Куда поставить локальный плеер по сообщению ведущего.
 * Смещение часов вычитается, поэтому разница Date.now() между телефоном и ноутбуком
 * не превращается в постоянные скачки.
 */
export function planRemoteSync(
  remote: RemoteAudioSync,
  local: LocalAudioSync,
  localNow: number,
  clockOffsetMs: number,
): SyncPlan {
  const duration = Number.isFinite(local.duration) ? local.duration : 0;
  const clamp = (time: number) => clampPlaybackTime(time, duration);

  if (!remote.playing) {
    return { kind: 'pause', time: clamp(remote.time) };
  }

  const age = localNow - remote.ts;
  if (!Number.isFinite(remote.ts) || remote.ts <= 0 || age > SYNC_STALE_MS) {
    return { kind: 'pause', time: clamp(remote.time) };
  }

  const elapsedSec = (localNow + clockOffsetMs - remote.ts) / 1000;
  const extra = Math.min(SYNC_MAX_EXTRAPOLATION_SEC, Math.max(0, elapsedSec));
  const target = clamp(remote.time + extra);
  const drift = Math.abs(local.currentTime - target);

  if (local.paused || drift >= SYNC_HARD_SEEK_SEC) {
    return { kind: 'play', seekTo: target };
  }

  return { kind: 'play', seekTo: null };
}

export function timeFromPointer(
  clientX: number,
  rect: { left: number; width: number },
  duration: number,
): number {
  if (!Number.isFinite(duration) || duration <= 0 || rect.width <= 0) return 0;
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  return ratio * duration;
}
