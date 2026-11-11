import { afterEach, expect, it, vi } from 'vitest';
import { scheduleImageResolution } from '../imageResolutionRequest';
afterEach(() => vi.useRealTimers());
it('does not start a superseded resolution during the settle interval', async () => {
  vi.useFakeTimers();
  const resolve = vi.fn(async () => 'image');
  const ready = vi.fn();
  const cancel = scheduleImageResolution({ delay: 150, resolve, ready, error: vi.fn() });
  await vi.advanceTimersByTimeAsync(100);
  cancel();
  await vi.advanceTimersByTimeAsync(100);
  expect(resolve).not.toHaveBeenCalled();
  expect(ready).not.toHaveBeenCalled();
  scheduleImageResolution({ delay: 150, resolve, ready, error: vi.fn() });
  await vi.advanceTimersByTimeAsync(150);
  expect(ready).toHaveBeenCalledWith('image');
});
it('aborts an active consumer and never publishes its stale result', async () => {
  let finish!: (value: string) => void;
  let signal!: AbortSignal;
  const ready = vi.fn();
  const error = vi.fn();
  const cancel = scheduleImageResolution({
    delay: 0,
    resolve: (s) => {
      signal = s;
      return new Promise<string>((r) => {
        finish = r;
      });
    },
    ready,
    error,
  });
  await Promise.resolve();
  expect(signal.aborted).toBe(false);
  cancel();
  finish('old');
  await Promise.resolve();
  await Promise.resolve();
  expect(signal.aborted).toBe(true);
  expect(ready).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
});
it('loads new files immediately and reports actual errors', async () => {
  const error = vi.fn();
  scheduleImageResolution({
    delay: 0,
    resolve: async () => {
      throw new Error('failed');
    },
    ready: vi.fn(),
    error,
  });
  await vi.waitFor(() => expect(error).toHaveBeenCalledTimes(1));
});
