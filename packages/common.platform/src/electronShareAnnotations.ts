/**
 * Electron screen-share annotation windows (see apps/xi.electron/src/main/share-annotations.ts).
 */

import { isElectronShell } from './detect';
import { getSovliumDesktop } from './electron';
import type { ShareCaptureSize } from './electron-api';

/** Frame-name prefixes; must match apps/xi.electron/src/shared/constants.ts. */
export const SHARE_ANNOTATION_CANVAS_FRAME_NAME = 'sovlium-share-annotation-canvas';
export const SHARE_ANNOTATION_TOOLBAR_FRAME_NAME = 'sovlium-share-annotation-toolbar';
export const SHARE_ANNOTATION_TOOLBAR_SIZE = { width: 520, height: 52 } as const;

export type { ShareCaptureSize };

/** Moves the canvas over the shared display and the toolbar to its top edge. */
export async function layoutShareAnnotations(capture: ShareCaptureSize | null): Promise<void> {
  if (!isElectronShell()) return;
  await getSovliumDesktop()?.screenShare.layoutAnnotations(capture);
}

/** Toolbar window size: the bar plus the panel opened under it. */
export async function setShareToolbarSize(size: { width: number; height: number }): Promise<void> {
  if (!isElectronShell()) return;
  await getSovliumDesktop()?.screenShare.setToolbarSize(size);
}

/** `false` lets clicks pass through the canvas to the apps underneath. */
export async function setShareAnnotationDrawing(enabled: boolean): Promise<void> {
  if (!isElectronShell()) return;
  await getSovliumDesktop()?.screenShare.setAnnotationDrawing(enabled);
}
