import { create } from 'zustand';
import type { TGeoShape } from '../../types';

type GeoDrawIntent = {
  geo: TGeoShape;
  lockAspect: boolean;
};

type GeoDrawIntentState = GeoDrawIntent & {
  setIntent: (intent: GeoDrawIntent) => void;
};

/** Локальный режим построения фигур. Не пишется в документ и не синхронизируется. */
export const useGeoDrawIntent = create<GeoDrawIntentState>((set) => ({
  geo: 'rectangle',
  lockAspect: false,
  setIntent: (intent) => set(intent),
}));

export function getGeoDrawIntent(): GeoDrawIntent {
  const { geo, lockAspect } = useGeoDrawIntent.getState();
  return { geo, lockAspect };
}
