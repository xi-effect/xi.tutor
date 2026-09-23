import { useEffect, useRef, type ReactElement, type ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';
import { getSovliumDesktop, isElectronMainSurface, type SlotBounds } from 'common.platform';
import { useElectronConferenceState } from './useElectronConferenceState';

function reportBounds(el: HTMLElement): void {
  const desktop = getSovliumDesktop();
  if (!desktop) return;
  const rect = el.getBoundingClientRect();
  const bounds: SlotBounds = {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  };
  void desktop.conference.setSlotBounds(bounds);
}

type ElectronConferenceSlotProps = {
  children: ReactNode;
};

export function ElectronConferenceSlot({ children }: ElectronConferenceSlotProps): ReactElement {
  const location = useLocation();
  const state = useElectronConferenceState();
  const slotRef = useRef<HTMLDivElement>(null);
  const onCallPage = location.pathname.includes('/call/');
  const visible = state.active && onCallPage;

  useEffect(() => {
    if (!isElectronMainSurface()) return;
    const desktop = getSovliumDesktop();
    const el = slotRef.current;
    if (!desktop || !visible || !el) {
      void desktop?.conference.setSlotBounds(null);
      return;
    }

    const report = () => reportBounds(el);
    const observer = new ResizeObserver(report);
    observer.observe(el);
    window.addEventListener('resize', report);
    document.addEventListener('scroll', report, true);
    report();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', report);
      document.removeEventListener('scroll', report, true);
    };
  }, [visible, state.classroomId]);

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
      {children}
      {visible ? (
        <div
          ref={slotRef}
          aria-hidden
          className="bg-background-page pointer-events-none absolute inset-0 z-40"
        />
      ) : null}
    </div>
  );
}
