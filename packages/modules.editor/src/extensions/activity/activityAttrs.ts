import type { Node } from '@tiptap/pm/model';
import {
  createEmptyAttempt,
  DEFAULT_ACTIVITY_STUDENT_ACCESS,
  DOCUMENT_ACTIVITY_KINDS,
  getDefaultDefinition,
  type ActivityAttempt,
  type ActivityDefinition,
  type ActivityDocumentValue,
  type ActivityKind,
  type CheckStatus,
} from 'modules.board/activities';

const KIND_SET = new Set<string>(DOCUMENT_ACTIVITY_KINDS);

function readJson<T>(raw: unknown): T | null {
  if (typeof raw === 'string' && raw) {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
  if (raw && typeof raw === 'object') return raw as T;
  return null;
}

function isDocumentKind(value: unknown): value is ActivityKind {
  return typeof value === 'string' && KIND_SET.has(value);
}

export function readActivityNode(node: Node): ActivityDocumentValue {
  const kind = isDocumentKind(node.attrs.kind) ? node.attrs.kind : 'gap-text';
  const parsedDefinition = readJson<ActivityDefinition>(node.attrs.definition);
  const definition =
    parsedDefinition && parsedDefinition.kind === kind
      ? parsedDefinition
      : getDefaultDefinition(kind);
  const parsedAttempt = readJson<ActivityAttempt>(node.attrs.attempt);
  const attempt = parsedAttempt ?? createEmptyAttempt(definition);
  const checkStatus = node.attrs.checkStatus;
  const status: CheckStatus =
    checkStatus === 'checked' || checkStatus === 'revealed' || checkStatus === 'idle'
      ? checkStatus
      : 'idle';

  return {
    id: typeof node.attrs.id === 'string' && node.attrs.id ? node.attrs.id : `activity-${kind}`,
    kind,
    title: typeof node.attrs.title === 'string' ? node.attrs.title : '',
    definition,
    attempt,
    checkStatus: status,
    studentAccess: {
      ...DEFAULT_ACTIVITY_STUDENT_ACCESS,
      ...readJson<ActivityDocumentValue['studentAccess']>(node.attrs.studentAccess),
    },
  };
}

export function serializeActivityNode(value: ActivityDocumentValue) {
  return {
    kind: value.kind,
    title: value.title,
    definition: JSON.stringify(value.definition),
    attempt: JSON.stringify(value.attempt),
    checkStatus: value.checkStatus,
    studentAccess: JSON.stringify(value.studentAccess),
  };
}
