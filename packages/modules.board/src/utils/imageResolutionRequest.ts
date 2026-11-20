/** Cancellation belongs to a consumer, not to a shared resize job. */
export function scheduleImageResolution<T>(options: {
  delay: number;
  resolve: (signal: AbortSignal) => Promise<T>;
  ready: (value: T) => void;
  error: (error: unknown) => void;
}) {
  const controller = new AbortController();
  const run = () => {
    void Promise.resolve()
      .then(() => {
        controller.signal.throwIfAborted();
        return options.resolve(controller.signal);
      })
      .then((value) => {
        if (!controller.signal.aborted) options.ready(value);
      })
      .catch((error) => {
        if (!controller.signal.aborted) options.error(error);
      });
  };
  const timer = options.delay > 0 ? setTimeout(run, options.delay) : undefined;
  if (!timer) run();
  return () => {
    clearTimeout(timer);
    controller.abort();
  };
}
