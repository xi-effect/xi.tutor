export {
  isNativeShell,
  isDesktopNative,
  isMobileNative,
  isTabletNative,
  getRuntimeKind,
  getNativeOs,
  type RuntimeKind,
  type NativeOs,
} from './src/detect';

export {
  getAppInfo,
  focusAppWindow,
  setAppTitle,
  onMainWindowFocusChanged,
  onAppFocusChanged,
  isMainWindowMinimized,
  unminimizeMainWindow,
  type AppInfo,
} from './src/window';

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

export { saveBlob, pickFiles, type SaveBlobOptions, type PickFilesOptions } from './src/files';

export {
  queryMediaPermission,
  requestMediaPermission,
  getUserMedia,
  getDisplayMedia,
  installNativeMediaAdapters,
  isScreenShareSupported,
  type MediaPermissionKind,
  type MediaPermissionStatus,
} from './src/media';

export {
  showShareOverlay,
  hideShareOverlay,
  focusMainFromShareOverlay,
  requestStopShareOverlay,
  onShareOverlayStop,
  onShareAnnotation,
  SHARE_OVERLAY_STOP_EVENT,
  SHARE_ANNOTATION_EVENT,
  type AnnotationTool,
  type AnnotationPoint,
  type AnnotationStroke,
  type AnnotationMessage,
} from './src/calls';

export {
  enterCallPip,
  leaveCallPip,
  resizeCallPip,
  onCallPipRestored,
  CALL_PIP_RESTORED_EVENT,
  type CallPipSize,
} from './src/callPip';

export { installNativeWebApiBridges, installDesktopWebApiBridges } from './src/install';

export {
  applyDocumentTheme,
  getShellTheme,
  setShellTheme,
  hydrateShellTheme,
  type ShellTheme,
} from './src/theme';
