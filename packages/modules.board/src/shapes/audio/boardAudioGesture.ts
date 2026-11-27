type AudioEntry = {
  audio: HTMLAudioElement;
  wantsPlay: () => boolean;
  onStarted: () => void;
  onBlocked: () => void;
};

type ControlGesture = (point: { clientX: number; clientY: number }) => void;

const entries = new Set<AudioEntry>();
const controlGestures = new WeakMap<HTMLElement, ControlGesture>();

let installed = false;

export function isNotAllowedError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: string }).name === 'NotAllowedError'
  );
}

function isTransportTarget(target: EventTarget | null): boolean {
  if (typeof HTMLElement === 'undefined' || !(target instanceof HTMLElement)) return false;
  const action = target.closest('[data-audio-action]')?.getAttribute('data-audio-action');
  return action === 'play' || action === 'enable';
}

/**
 * play() с телефона и планшета разрешён только внутри пользовательского жеста
 * и только для того элемента, который уже запускали жестом.
 * Любое следующее касание доски доигрывает то, что синхронизация не смогла запустить сама.
 */
export function flushBoardAudioGesture(target?: EventTarget | null): void {
  if (isTransportTarget(target ?? null)) return;

  for (const entry of entries) {
    if (!entry.wantsPlay()) continue;
    const { audio } = entry;
    if (!audio.src) continue;
    if (!audio.paused) {
      entry.onStarted();
      continue;
    }
    void audio
      .play()
      .then(() => entry.onStarted())
      .catch((error: unknown) => {
        if (isNotAllowedError(error)) entry.onBlocked();
      });
  }
}

export function installBoardAudioGestureUnlock(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  const onGesture = (event: Event) => {
    flushBoardAudioGesture(event.target);
  };

  document.addEventListener('pointerdown', onGesture, true);
  document.addEventListener('touchend', onGesture, true);
}

export function registerBoardAudio(entry: AudioEntry): () => void {
  installBoardAudioGestureUnlock();
  entries.add(entry);
  return () => {
    entries.delete(entry);
  };
}

/**
 * Повторно посланный PointerEvent не считается жестом, и iOS глушит play().
 * Обработчик вешаем на реальный DOM-узел контрола и вызываем его из исходного touch.
 */
export function registerAudioControlGesture(
  element: HTMLElement,
  handler: ControlGesture,
): () => void {
  controlGestures.set(element, handler);
  return () => {
    if (controlGestures.get(element) === handler) controlGestures.delete(element);
  };
}

export function invokeAudioControlGesture(
  element: HTMLElement,
  point: { clientX: number; clientY: number },
): boolean {
  const handler = controlGestures.get(element);
  if (!handler) return false;
  handler(point);
  return true;
}
