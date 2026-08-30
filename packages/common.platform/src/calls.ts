import { isDesktopNative } from './detect';
import { invokeCommand, listenCommand } from './native';

export const SHARE_OVERLAY_STOP_EVENT = 'share-overlay-stop';
export const SHARE_ANNOTATION_EVENT = 'share-annotate-stroke';

export type AnnotationTool = 'pen' | 'highlighter' | 'eraser';

/**
 * Coordinates are fractions of the captured surface (0..1), so a stroke drawn
 * on a 4K display lands on exactly the same spot of a 720p downscaled track.
 */
export type AnnotationPoint = [number, number];

export type AnnotationStroke = {
  id: string;
  tool: AnnotationTool;
  color: string;
  /** Line width as a fraction of the surface height. */
  width: number;
  points: AnnotationPoint[];
};

export type AnnotationMessage =
  | { type: 'begin'; stroke: AnnotationStroke }
  | { type: 'append'; id: string; points: AnnotationPoint[] }
  | { type: 'end'; id: string }
  | { type: 'undo' }
  | { type: 'clear' }
  | { type: 'sync'; strokes: AnnotationStroke[] };

export async function onShareAnnotation(
  handler: (message: AnnotationMessage) => void,
): Promise<() => void> {
  if (!isDesktopNative()) return () => undefined;
  return listenCommand<AnnotationMessage>(SHARE_ANNOTATION_EVENT, handler);
}

export async function showShareOverlay(): Promise<void> {
  if (!isDesktopNative()) return;
  await invokeCommand('share_overlay_show');
}

export async function hideShareOverlay(): Promise<void> {
  if (!isDesktopNative()) return;
  await invokeCommand('share_overlay_hide');
}

export async function focusMainFromShareOverlay(): Promise<void> {
  if (!isDesktopNative()) return;
  await invokeCommand('share_overlay_focus_main');
}

export async function requestStopShareOverlay(): Promise<void> {
  if (!isDesktopNative()) return;
  await invokeCommand('share_overlay_request_stop');
}

export async function onShareOverlayStop(handler: () => void): Promise<() => void> {
  if (!isDesktopNative()) return () => undefined;
  return listenCommand(SHARE_OVERLAY_STOP_EVENT, handler);
}
