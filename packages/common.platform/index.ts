import './src/electron-api';

export {
  isNativeShell,
  isDesktopNative,
  isMobileNative,
  isTabletNative,
  isElectronShell,
  isTauriShell,
  isElectronMainSurface,
  isElectronConferenceSurface,
  getElectronSurface,
  getNativeRuntime,
  getRuntimeKind,
  getNativeOs,
  type RuntimeKind,
  type NativeRuntime,
  type NativeOs,
  type ElectronSurface,
} from './src/detect';

export { getSovliumDesktop } from './src/electron';
export type {
  SovliumDesktopAPI,
  ConferenceState,
  SlotBounds,
  UpdaterState,
  UpdaterStatus,
} from './src/electron-api';

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

export { setDisplaySleepBlocked } from './src/power';

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

export {
  isElectronCallOverlayOpen,
  closeElectronCallOverlay,
  CALL_OVERLAY_CHANGE_EVENT,
} from './src/electronCallOverlay';

export {
  registerShareSourcePicker,
  getLastShareSource,
  SHARE_SOURCE_CHANGE_EVENT,
  type ShareSource,
  type ShareSourcePicker,
} from './src/shareSourcePicker';

export {
  getRemoteControlStatus,
  requestRemoteControlAccess,
  setRemoteControlActive,
  sendRemoteInput,
  type RemoteControlStatus,
  type RemoteInput,
  type RemoteModifiers,
  type RemoteMouseButton,
  type RemoteOrigin,
} from './src/remoteControl';

export {
  layoutShareAnnotations,
  setShareAnnotationDrawing,
  setShareToolbarSize,
  SHARE_ANNOTATION_CANVAS_FRAME_NAME,
  SHARE_ANNOTATION_TOOLBAR_FRAME_NAME,
  SHARE_ANNOTATION_TOOLBAR_SIZE,
  type ShareCaptureSize,
} from './src/electronShareAnnotations';

export { installNativeWebApiBridges, installDesktopWebApiBridges } from './src/install';

export {
  applyDocumentTheme,
  getShellTheme,
  setShellTheme,
  hydrateShellTheme,
  type ShellTheme,
} from './src/theme';
