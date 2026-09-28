export { ActivityDocument } from './ui/ActivityDocument';
export type { ActivityDocumentValue } from './ui/ActivityDocument';
export { useActivityDocumentRole } from './ui/useActivityDocumentRole';
export { DOCUMENT_ACTIVITY_KINDS } from './model/kinds';
export type { ActivityKind } from './model/kinds';
export { ACTIVITY_KIND_ICONS } from './ui/activityKindIcons';
export { getDefaultDefinition, createEmptyAttempt } from './model/defaults';
export { DEFAULT_ACTIVITY_STUDENT_ACCESS, normalizeStudentAccess } from './model/studentAccess';
export type { ActivityStudentAccessKey } from './model/studentAccess';
export type { ActivityAttempt, ActivityDefinition, CheckStatus } from './model/types';
export { hasCheckableAnswers } from './primitives/evaluate';
export { resetAttempt, revealAttempt } from './primitives/reset';
export { normalizeMultipleChoiceDefinition } from './model/multipleChoice';
export { useActivityEditStore } from './store/activityEditStore';
export {
  STUDENT_ACCESS_LABEL_KEYS,
  getActivityMenuActions,
  studentAccessItems,
} from './ui/activityMenuActions';
export type { ActivityMenuActionId } from './ui/activityMenuActions';
export type { ActivityShape } from './shape/ActivityShape';
export { Activity } from '../ui/icons/Activity';
