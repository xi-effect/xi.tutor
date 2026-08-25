/**
 * Desktop screen-share overlay IPC (Zoom-like always-on-top bar).
 * See `src-tauri/src/share_overlay.rs`.
 *
 * Implementation lives in `common.platform` so the remote UI on *.sovlium.ru
 * can call the same commands after navigation.
 */

export {
  SHARE_OVERLAY_STOP_EVENT,
  showShareOverlay,
  hideShareOverlay,
  focusMainFromShareOverlay,
  requestStopShareOverlay,
} from 'common.platform';
