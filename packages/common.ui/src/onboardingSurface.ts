type Listener = () => void;

let active = false;
const listeners = new Set<Listener>();

export const isOnboardingSurfaceActive = (): boolean => active;

export const setOnboardingSurfaceActive = (next: boolean): void => {
  if (active === next) return;
  active = next;
  listeners.forEach((listener) => listener());
};

export const subscribeOnboardingSurface = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
