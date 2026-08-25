export {
  isNativeShell,
  isDesktopNative,
  isMobileNative,
  getRuntimeKind,
  getNativeOs,
  type RuntimeKind,
  type NativeOs,
} from './src/detect';

export { getAppInfo, focusAppWindow, setAppTitle, type AppInfo } from './src/window';

export { openUrl, isHttpUrl, shouldSkipBlankPopup } from './src/links';

export {
  isNotificationSupported,
  getNotificationPermission,
  refreshNotificationPermission,
  requestNotificationPermission,
  showNotification,
  resetNotificationPermissionCache,
  isDesktopNotificationsPreferred,
  type ShowNotificationOptions,
  type NotificationPermissionState,
} from './src/notifications';

export { writeText, readText, writeHtmlAndText, readHtml } from './src/clipboard';

export {
  saveBlob,
  pickFiles,
  type SaveBlobOptions,
  type PickFilesOptions,
} from './src/files';

export {
  queryMediaPermission,
  requestMediaPermission,
  getUserMedia,
  getDisplayMedia,
  installNativeMediaAdapters,
  type MediaPermissionKind,
  type MediaPermissionStatus,
} from './src/media';

export {
  showShareOverlay,
  hideShareOverlay,
  focusMainFromShareOverlay,
  requestStopShareOverlay,
  onShareOverlayStop,
  SHARE_OVERLAY_STOP_EVENT,
} from './src/calls';

export { installDesktopWebApiBridges } from './src/install';
