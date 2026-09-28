import { useEffect, useState } from 'react';
import { getSovliumDesktop, type ConferenceState } from 'common.platform';

const EMPTY_STATE: ConferenceState = {
  active: false,
  classroomId: null,
  presentation: 'hidden',
  floating: false,
};

export function useElectronConferenceState(): ConferenceState {
  const [state, setState] = useState<ConferenceState>(EMPTY_STATE);

  useEffect(() => {
    const desktop = getSovliumDesktop();
    if (!desktop) return;

    let cancelled = false;
    void desktop.conference.getState().then((next) => {
      if (!cancelled) setState(next);
    });
    const unsubscribe = desktop.conference.onStateChanged(setState);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return state;
}
