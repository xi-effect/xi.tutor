import type { AnnotationMessage, AnnotationStroke } from 'common.platform';

export const ANNOTATION_TOPIC = 'share-annotations';

/**
 * Strokes are positioned relative to the captured surface. That mapping only
 * holds when a whole display is shared: for a single window the annotation
 * canvas covers the screen, not the window, so the receiver drops the strokes.
 */
export type AnnotationSurface = 'monitor' | 'other';

export type AnnotationWireMessage = {
  surface: AnnotationSurface;
  message: AnnotationMessage;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function encodeAnnotation(payload: AnnotationWireMessage): Uint8Array {
  return encoder.encode(JSON.stringify(payload));
}

export function decodeAnnotation(payload: Uint8Array): AnnotationWireMessage | null {
  try {
    const parsed = JSON.parse(decoder.decode(payload)) as AnnotationWireMessage;
    if (!parsed?.message?.type) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Applies a message to a stroke list, returning the next list. */
export function reduceStrokes(
  strokes: AnnotationStroke[],
  message: AnnotationMessage,
): AnnotationStroke[] {
  switch (message.type) {
    case 'sync':
      return message.strokes;
    case 'clear':
      return [];
    case 'undo':
      return strokes.slice(0, -1);
    case 'begin':
      return [...strokes, message.stroke];
    case 'append': {
      const index = strokes.findIndex((stroke) => stroke.id === message.id);
      if (index === -1) return strokes;
      const next = strokes.slice();
      const target = next[index];
      next[index] = { ...target, points: [...target.points, ...message.points] };
      return next;
    }
    case 'end':
      return strokes;
    default:
      return strokes;
  }
}
