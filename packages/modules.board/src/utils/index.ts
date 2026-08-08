export { isEditableTarget } from './isEditableTarget';
export {
  isEmptyLabelShape,
  isEmptyLabelEditOnTypeContext,
  shouldIgnoreBoardHotkeys,
} from './boardKeyboard';
export { isMac } from './getUserPlatform';
export { writeClipboardHtmlAndText, readClipboardHtml } from './clipboard';
export { serializeDrawContent, deserializeDrawContent } from './drawContent';
export { maskId, maskToken, maskUrl } from './maskSensitiveData';
export { generateUserColor } from './userColor';
export {
  createProviderInstance,
  getOrCreateProfile,
  getProfile,
  logProviderEvent,
  logAllProvidersSummary,
  updateProfile,
} from './yjsProfiling';
export { BOARD_SCHEMA_VERSION } from './yjsConstants';
export { normalizeStoredFileSrc, warnIfPersistingFullStorageUrl } from './storedFileSrc';
export { isShapeErasable } from './isShapeErasable';
export {
  buildBoardDeepLink,
  copyBoardDeepLink,
  focusBoardComment,
  focusBoardShapes,
  hasBoardDeepLinkSearch,
  parseShapeIdsFromSearch,
  type BoardDeepLinkSearch,
} from './boardDeepLink';
export {
  applyYjsBoardUpdate,
  ensureYjsStorePopulated,
  getYjsBoardDocInfo,
  readYjsBoardRecords,
  ydocIdFromBoardDumpFilename,
  type YjsBoardDocInfo,
} from './parseYjsBoardDoc';

export { resolveShapeCoordinates } from './resolveShapeCoordinates';
