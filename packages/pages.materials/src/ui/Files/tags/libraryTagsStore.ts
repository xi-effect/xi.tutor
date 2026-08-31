import { DEFAULT_TAG_COLOR, isLibraryTagColorId, type LibraryTagColorId } from './tagColors';

const STORAGE_KEY = 'xi.tutor.library-tags.v1';

export type LibraryTag = {
  id: string;
  name: string;
  color: LibraryTagColorId;
};

export type LibraryTagsState = {
  tags: LibraryTag[];
  fileTagIds: Record<string, string[]>;
};

const EMPTY_STATE: LibraryTagsState = {
  tags: [],
  fileTagIds: {},
};

let state: LibraryTagsState = loadState();
const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

const createId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseTag(value: unknown): LibraryTag | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string') {
    return null;
  }

  const name = value.name.trim();
  if (!value.id || !name) {
    return null;
  }

  return {
    id: value.id,
    name,
    color:
      typeof value.color === 'string' && isLibraryTagColorId(value.color)
        ? value.color
        : DEFAULT_TAG_COLOR,
  };
}

function parseState(value: unknown): LibraryTagsState {
  if (!isRecord(value) || !Array.isArray(value.tags)) {
    return EMPTY_STATE;
  }

  const tags: LibraryTag[] = [];
  const seen = new Set<string>();

  value.tags.forEach((item) => {
    const tag = parseTag(item);
    if (!tag || seen.has(tag.id)) {
      return;
    }

    seen.add(tag.id);
    tags.push(tag);
  });

  const tagIds = new Set(tags.map((tag) => tag.id));
  const fileTagIds: Record<string, string[]> = {};

  if (isRecord(value.fileTagIds)) {
    Object.entries(value.fileTagIds).forEach(([fileId, ids]) => {
      if (!fileId || !Array.isArray(ids)) {
        return;
      }

      const nextIds = [
        ...new Set(ids.filter((id): id is string => typeof id === 'string' && tagIds.has(id))),
      ];

      if (nextIds.length > 0) {
        fileTagIds[fileId] = nextIds;
      }
    });
  }

  return { tags, fileTagIds };
}

function loadState(): LibraryTagsState {
  if (typeof window === 'undefined') {
    return EMPTY_STATE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return EMPTY_STATE;
    }

    return parseState(JSON.parse(raw));
  } catch {
    return EMPTY_STATE;
  }
}

function persist(next: LibraryTagsState) {
  state = next;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* localStorage full or unavailable */
    }
  }

  emit();
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) {
      return;
    }

    state = loadState();
    emit();
  });
}

export const getLibraryTagsSnapshot = (): LibraryTagsState => state;

export const getLibraryTagsServerSnapshot = (): LibraryTagsState => EMPTY_STATE;

export const subscribeLibraryTags = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const isBackendTagId = (id: string): boolean => /^\d+$/.test(id);

export const upsertLibraryTag = (tag: LibraryTag): LibraryTag => {
  const name = tag.name.trim();
  const existing = state.tags.find((item) => item.id === tag.id);
  const nextTag: LibraryTag = {
    id: tag.id,
    name,
    color: tag.color || existing?.color || DEFAULT_TAG_COLOR,
  };

  persist({
    tags: existing
      ? state.tags.map((item) => (item.id === tag.id ? nextTag : item))
      : [...state.tags, nextTag],
    fileTagIds: state.fileTagIds,
  });

  return nextTag;
};

export const rememberApiTags = (tags: { id: number; name: string }[]): void => {
  tags.forEach((tag) => {
    const existing = state.tags.find((item) => item.id === String(tag.id));
    upsertLibraryTag({
      id: String(tag.id),
      name: tag.name,
      color: existing?.color ?? DEFAULT_TAG_COLOR,
    });
  });
};

export const remapLibraryTagId = (fromId: string, toId: string, name?: string): void => {
  if (fromId === toId) {
    return;
  }

  const from = state.tags.find((tag) => tag.id === fromId);
  const to = state.tags.find((tag) => tag.id === toId);
  const nextTag: LibraryTag = {
    id: toId,
    name: name?.trim() || to?.name || from?.name || '',
    color: from?.color || to?.color || DEFAULT_TAG_COLOR,
  };

  const fileTagIds: Record<string, string[]> = {};
  Object.entries(state.fileTagIds).forEach(([fileId, ids]) => {
    const nextIds = [...new Set(ids.map((id) => (id === fromId ? toId : id)))];
    if (nextIds.length > 0) {
      fileTagIds[fileId] = nextIds;
    }
  });

  persist({
    tags: [...state.tags.filter((tag) => tag.id !== fromId && tag.id !== toId), nextTag],
    fileTagIds,
  });
};

export const createLibraryTag = (name: string, color: LibraryTagColorId): LibraryTag => {
  const tag: LibraryTag = {
    id: createId(),
    name: name.trim(),
    color,
  };

  persist({
    tags: [...state.tags, tag],
    fileTagIds: state.fileTagIds,
  });

  return tag;
};

export const updateLibraryTag = (
  tagId: string,
  patch: { name?: string; color?: LibraryTagColorId },
): void => {
  persist({
    tags: state.tags.map((tag) =>
      tag.id === tagId
        ? {
            ...tag,
            name: patch.name?.trim() || tag.name,
            color: patch.color ?? tag.color,
          }
        : tag,
    ),
    fileTagIds: state.fileTagIds,
  });
};

export const deleteLibraryTag = (tagId: string): void => {
  const fileTagIds: Record<string, string[]> = {};

  Object.entries(state.fileTagIds).forEach(([fileId, ids]) => {
    const nextIds = ids.filter((id) => id !== tagId);
    if (nextIds.length > 0) {
      fileTagIds[fileId] = nextIds;
    }
  });

  persist({
    tags: state.tags.filter((tag) => tag.id !== tagId),
    fileTagIds,
  });
};

export const toggleFileLibraryTag = (fileId: string, tagId: string): void => {
  const current = state.fileTagIds[fileId] ?? [];
  const nextIds = current.includes(tagId)
    ? current.filter((id) => id !== tagId)
    : [...current, tagId];

  const fileTagIds = { ...state.fileTagIds };

  if (nextIds.length > 0) {
    fileTagIds[fileId] = nextIds;
  } else {
    delete fileTagIds[fileId];
  }

  persist({
    tags: state.tags,
    fileTagIds,
  });
};
