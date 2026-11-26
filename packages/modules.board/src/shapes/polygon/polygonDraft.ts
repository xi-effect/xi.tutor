import { create } from 'zustand';
import type { Pt } from './polygonGeometry';

export type PolygonGuide = { a: Pt; b: Pt };

export type PolygonDraft = {
  kind: 'triangle' | 'trapezoid';
  points: Pt[];
  cursor: Pt | null;
  valid: boolean;
  guide: PolygonGuide | null;
};

type PolygonDraftState = {
  draft: PolygonDraft | null;
  setDraft: (draft: PolygonDraft | null) => void;
};

/** Черновик построения. Не попадает в документ и не синхронизируется. */
export const usePolygonDraft = create<PolygonDraftState>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
}));
