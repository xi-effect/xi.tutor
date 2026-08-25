/** Форматирует секунды cooldown в MM:SS. */
export const formatResendCooldown = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

/** Оставшиеся секунды до разрешённой повторной отправки письма. */
export const calculateResendTimeRemaining = (
  allowedAt: string | null | undefined,
  now: Date = new Date(),
): number => {
  if (!allowedAt) return 0;

  const allowedDate = new Date(allowedAt);
  const diffInSeconds = Math.floor((allowedDate.getTime() - now.getTime()) / 1000);

  return Math.max(0, diffInSeconds);
};
