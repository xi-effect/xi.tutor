import { env } from 'common.env';
import { HttpMethod } from './config';

const AUTOCOMPLETE_SERVICE_URL = `${env.VITE_SERVER_URL_BACKEND}/api/protected/autocomplete-service`;

export type TagKind = 'subject' | 'generic';

export const TAG_KIND = {
  Subject: 'subject',
  Generic: 'generic',
} as const satisfies Record<string, TagKind>;

export interface TagSchema {
  id: number;
  name: string;
}

export interface CreateTagBody {
  name: string;
}

export type UpdateTagBody = CreateTagBody;

export const TAG_AUTOCOMPLETE_DEFAULT_LIMIT = 10;
export const TAG_AUTOCOMPLETE_MAX_LIMIT = 20;
export const TAG_AUTOCOMPLETE_MIN_SEARCH_LENGTH = 1;
export const TAG_AUTOCOMPLETE_MAX_SEARCH_LENGTH = 100;
export const TAG_NAME_MIN_LENGTH = 1;
export const TAG_NAME_MAX_LENGTH = 100;
export const TAG_MAX_COUNT = 100;

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
  buildTagKindUrl,
  buildTutorTagKindUrl,
};
