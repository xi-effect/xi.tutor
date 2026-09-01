import { env } from 'common.env';
import { HttpMethod } from './config';

const AUTOCOMPLETE_SERVICE_URL = `${env.VITE_SERVER_URL_BACKEND}/api/protected/autocomplete-service`;

export type TagKind = 'subject' | 'generic';

export const TAG_KIND = {
  Subject: 'subject',
  Generic: 'generic',
} as const satisfies Record<string, TagKind>;

export type TagColor =
  'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'indigo' | 'purple' | 'pink' | 'brown';

export const TAG_COLORS = [
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'indigo',
  'purple',
  'pink',
  'brown',
] as const satisfies readonly TagColor[];

export const DEFAULT_TAG_COLOR: TagColor = 'blue';

export const isTagColor = (value: string): value is TagColor =>
  (TAG_COLORS as readonly string[]).includes(value);

export interface TagSchema {
  id: number;
  name: string;
  color: TagColor;
}

export interface CreateTagBody {
  name: string;
  color: TagColor;
}

export type UpdateTagBody = {
  name?: string;
  color?: TagColor;
};

export const TAG_ASSIGN_MAX_COUNT = 5;
export const TAG_FILE_ASSIGN_MAX_COUNT = TAG_ASSIGN_MAX_COUNT;
export const TAG_FILTER_MAX_COUNT = TAG_ASSIGN_MAX_COUNT;

export const TAG_AUTOCOMPLETE_DEFAULT_LIMIT = 10;
export const TAG_AUTOCOMPLETE_MAX_LIMIT = 20;
export const TAG_AUTOCOMPLETE_MIN_SEARCH_LENGTH = 1;
export const TAG_AUTOCOMPLETE_MAX_SEARCH_LENGTH = 100;
export const TAG_NAME_MIN_LENGTH = 1;
export const TAG_NAME_MAX_LENGTH = 100;
export const TAG_MAX_COUNT = 100;

function normalizeTagIds(ids?: number[] | null, max = TAG_ASSIGN_MAX_COUNT): number[] | null {
  if (!ids?.length) {
    return null;
  }

  const unique: number[] = [];
  const seen = new Set<number>();

  for (const id of ids) {
    if (!Number.isInteger(id) || id <= 0 || seen.has(id)) {
      continue;
    }
    seen.add(id);
    unique.push(id);
    if (unique.length >= max) {
      break;
    }
  }

  return unique.length > 0 ? unique : null;
}

enum TagsQueryKey {
  GetTagById = 'GetTagById',
  TagsAutocomplete = 'TagsAutocomplete',
  CreateTag = 'CreateTag',
  UpdateTag = 'UpdateTag',
  DeleteTag = 'DeleteTag',
}

function normalizeTagAutocompleteLimit(limit?: number): number {
  const value = limit ?? TAG_AUTOCOMPLETE_DEFAULT_LIMIT;
  return Math.min(Math.max(value, 1), TAG_AUTOCOMPLETE_MAX_LIMIT);
}

function buildTagKindUrl(kind: TagKind, path: string): string {
  return `${AUTOCOMPLETE_SERVICE_URL}/tag-kinds/${kind}/${path}`;
}

function buildTutorTagKindUrl(kind: TagKind, path: string): string {
  return `${AUTOCOMPLETE_SERVICE_URL}/roles/tutor/tag-kinds/${kind}/${path}`;
}

const tagsApiConfig = {
  [TagsQueryKey.GetTagById]: {
    getUrl: (kind: TagKind, id: number) => buildTagKindUrl(kind, `tags/${id}/`),
    method: HttpMethod.GET,
  },
  [TagsQueryKey.TagsAutocomplete]: {
    getUrl: (kind: TagKind, search: string, limit?: number) => {
      const params = new URLSearchParams({
        search,
        limit: String(normalizeTagAutocompleteLimit(limit)),
      });
      return `${buildTagKindUrl(kind, 'autocomplete-suggestions/')}?${params.toString()}`;
    },
    method: HttpMethod.GET,
  },
  [TagsQueryKey.CreateTag]: {
    getUrl: (kind: TagKind) => buildTutorTagKindUrl(kind, 'tags/'),
    method: HttpMethod.POST,
  },
  [TagsQueryKey.UpdateTag]: {
    getUrl: (kind: TagKind, id: number) => buildTutorTagKindUrl(kind, `tags/${id}/`),
    method: HttpMethod.PATCH,
  },
  [TagsQueryKey.DeleteTag]: {
    getUrl: (kind: TagKind, id: number) => buildTutorTagKindUrl(kind, `tags/${id}/`),
    method: HttpMethod.DELETE,
  },
};

const tagsQueryKeys = {
  autocomplete: (kind: TagKind, search: string, limit: number): (string | number)[] => [
    TagsQueryKey.TagsAutocomplete,
    kind,
    search,
    limit,
  ],
  byId: (kind: TagKind, id: number): (string | number)[] => [TagsQueryKey.GetTagById, kind, id],
  mutations: (kind: TagKind): string[] => [TagsQueryKey.CreateTag, kind],
};

export {
  tagsApiConfig,
  TagsQueryKey,
  tagsQueryKeys,
  normalizeTagAutocompleteLimit,
  normalizeTagIds,
  buildTagKindUrl,
  buildTutorTagKindUrl,
};
