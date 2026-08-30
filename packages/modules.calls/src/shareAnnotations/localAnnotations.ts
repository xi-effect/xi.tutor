/**
 * Mirror of the strokes this client is publishing.
 *
 * The annotation window is excluded from capture, so the sharer's own self-view
 * would otherwise stay empty and there would be no way to tell what the remote
 * side actually receives.
 */

import { useSyncExternalStore } from 'react';
import type { AnnotationStroke } from 'common.platform';

const EMPTY: AnnotationStroke[] = [];

let strokes: AnnotationStroke[] = EMPTY;
const listeners = new Set<() => void>();

export function setLocalAnnotations(next: AnnotationStroke[]): void {
  strokes = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): AnnotationStroke[] {
  return strokes;
}

export function useLocalAnnotations(): AnnotationStroke[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
