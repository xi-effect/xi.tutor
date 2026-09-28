import { BrowserWindow, desktopCapturer, type DesktopCapturerSource } from 'electron';
import type { ShareSource } from '../shared/types';

/**
 * Screen-share source selection for the in-app picker.
 *
 * The macOS system picker (`useSystemPicker`) hides which display or window was
 * chosen, and its capture path letterboxes 16:10 displays and leaves out the
 * app's own annotation canvas. The renderer lists sources here, the user picks
 * one in the call UI, and the display-media handler grants exactly that source.
 */

const SELECTION_TTL_MS = 15_000;
const THUMBNAIL_SIZE = { width: 480, height: 300 };

let pending: { id: string; at: number } | null = null;

function ownWindowSourceIds(): Set<string> {
  const ids = new Set<string>();
  for (const window of BrowserWindow.getAllWindows()) {
    if (window.isDestroyed()) continue;
    try {
      ids.add(window.getMediaSourceId());
    } catch {
      // window without a native handle yet
    }
  }
  return ids;
}

function kindOf(source: DesktopCapturerSource): ShareSource['kind'] {
  return source.id.startsWith('screen:') ? 'screen' : 'window';
}

export async function listShareSources(): Promise<ShareSource[]> {
  const own = ownWindowSourceIds();
  const sources = await desktopCapturer.getSources({
    types: ['screen', 'window'],
    thumbnailSize: THUMBNAIL_SIZE,
    fetchWindowIcons: true,
  });
  return sources
    .filter((source) => !own.has(source.id))
    .filter((source) => kindOf(source) === 'screen' || !source.thumbnail.isEmpty())
    .map((source) => ({
      id: source.id,
      name: source.name,
      kind: kindOf(source),
      displayId: source.display_id || null,
      thumbnail: source.thumbnail.isEmpty() ? '' : source.thumbnail.toDataURL(),
      appIcon: source.appIcon && !source.appIcon.isEmpty() ? source.appIcon.toDataURL() : null,
    }));
}

export function selectShareSource(id: string | null): void {
  pending = id ? { id, at: Date.now() } : null;
}

/** The source chosen in the in-app picker, or the first display as a fallback. */
export async function resolveShareSource(): Promise<DesktopCapturerSource | null> {
  // Not cleared on use: the renderer retries getDisplayMedia once with fallback options.
  const selection = pending && Date.now() - pending.at < SELECTION_TTL_MS ? pending.id : null;
  const sources = await desktopCapturer.getSources({
    types: ['screen', 'window'],
    thumbnailSize: { width: 0, height: 0 },
  });
  if (selection) {
    const chosen = sources.find((source) => source.id === selection);
    if (chosen) return chosen;
  }
  return sources.find((source) => kindOf(source) === 'screen') ?? sources[0] ?? null;
}
