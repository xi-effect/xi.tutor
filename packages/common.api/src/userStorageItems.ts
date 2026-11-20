import { env } from 'common.env';
import { HttpMethod } from './config';

/** Ключ в пути: OpenAPI `minLength: 1`, `maxLength: 100`. */
export const USER_STORAGE_ITEM_KEY_MAX_LENGTH = 100;

/** Произвольный JSON в `value`. Бэкенд отвечает 413, если больше. */
export const USER_STORAGE_ITEM_VALUE_MAX_BYTES = 64 * 1024;

const JSON_MAX_DEPTH = 32;

export type JsonValue =
  null | string | number | boolean | JsonValue[] | { [key: string]: JsonValue };

/** DTO GET/PUT `/users/current/storage-items/{key}/` — OpenAPI `UserStorageItemValueSchema`. */
export type UserStorageItemValueSchema = {
  value: JsonValue;
};

const isRecord = (data: unknown): data is Record<string, unknown> =>
  typeof data === 'object' && data !== null && !Array.isArray(data);

const isJsonValue = (value: unknown, depth: number): value is JsonValue => {
  if (depth > JSON_MAX_DEPTH) return false;
  if (value === null) return true;

  const kind = typeof value;
  if (kind === 'string' || kind === 'boolean') return true;
  if (kind === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every((item) => isJsonValue(item, depth + 1));
  if (isRecord(value)) return Object.values(value).every((item) => isJsonValue(item, depth + 1));

  return false;
};

export const assertUserStorageItemKey = (key: string): void => {
  if (typeof key !== 'string' || key.length < 1 || key.length > USER_STORAGE_ITEM_KEY_MAX_LENGTH) {
    throw new Error('Invalid user storage item key');
  }
};

export const userStorageItemValueBytes = (value: JsonValue): number => {
  const serialized = JSON.stringify(value);
  if (typeof serialized !== 'string') {
    throw new Error('Invalid user storage item value');
  }

  return new TextEncoder().encode(serialized).length;
};

export const assertUserStorageItemValueSize = (value: JsonValue): void => {
  if (userStorageItemValueBytes(value) > USER_STORAGE_ITEM_VALUE_MAX_BYTES) {
    throw new Error('User storage item value too large');
  }
};

export const isUserStorageItemValueSchema = (data: unknown): data is UserStorageItemValueSchema => {
  if (!isRecord(data) || !('value' in data)) return false;
  return isJsonValue(data.value, 0);
};

export const parseUserStorageItemValue = (data: unknown): JsonValue => {
  if (!isUserStorageItemValueSchema(data)) {
    throw new Error('Invalid UserStorageItemValueSchema');
  }

  return data.value;
};

enum UserStorageItemsQueryKey {
  GetCurrentItem = 'GetCurrentUserStorageItem',
  UpsertCurrentItem = 'UpsertCurrentUserStorageItem',
  DeleteCurrentItem = 'DeleteCurrentUserStorageItem',
}

const getCurrentUserStorageItemUrl = (key: string) =>
  `${env.VITE_SERVER_URL_BACKEND}/api/protected/user-service/users/current/storage-items/${encodeURIComponent(key)}/`;

const userStorageItemsApiConfig = {
  [UserStorageItemsQueryKey.GetCurrentItem]: {
    getUrl: getCurrentUserStorageItemUrl,
    method: HttpMethod.GET,
  },
  [UserStorageItemsQueryKey.UpsertCurrentItem]: {
    getUrl: getCurrentUserStorageItemUrl,
    method: HttpMethod.PUT,
  },
  [UserStorageItemsQueryKey.DeleteCurrentItem]: {
    getUrl: getCurrentUserStorageItemUrl,
    method: HttpMethod.DELETE,
  },
};

const userStorageItemsQueryKeys = {
  current: (userId: number | null, key: string) =>
    [UserStorageItemsQueryKey.GetCurrentItem, userId, key] as const,
};

export { userStorageItemsApiConfig, UserStorageItemsQueryKey, userStorageItemsQueryKeys };
