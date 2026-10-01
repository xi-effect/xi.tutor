import { env } from 'common.env';
import { HttpMethod } from './config';

export const USER_FLAG_KEYS = {
  SUBSCRIPTION_ANNOUNCEMENT_DISMISSED: 'was_subscription_announcement_dismissed',
  SUBSCRIPTION_RELEASE_NOTE_DISMISSED: 'was_subscription_release_note_dismissed',
} as const;

export type UserFlagKey = (typeof USER_FLAG_KEYS)[keyof typeof USER_FLAG_KEYS];

/** DTO GET/PUT `/users/current/flags/{key}/` — OpenAPI `UserFlagValueSchema`. */
export type UserFlagValueSchema = {
  value: boolean;
};

export const isUserFlagValueSchema = (data: unknown): data is UserFlagValueSchema => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  if (!('value' in data)) {
    return false;
  }

  return typeof data.value === 'boolean';
};

export const parseUserFlagValue = (data: unknown): boolean => {
  if (!isUserFlagValueSchema(data)) {
    throw new Error('Invalid UserFlagValueSchema');
  }

  return data.value;
};

enum UserFlagsQueryKey {
  GetCurrentFlag = 'GetCurrentUserFlag',
  UpsertCurrentFlag = 'UpsertCurrentUserFlag',
}

const getCurrentUserFlagUrl = (key: string) =>
  `${env.VITE_SERVER_URL_BACKEND}/api/protected/user-service/users/current/flags/${encodeURIComponent(key)}/`;

const userFlagsApiConfig = {
  [UserFlagsQueryKey.GetCurrentFlag]: {
    getUrl: getCurrentUserFlagUrl,
    method: HttpMethod.GET,
  },
  [UserFlagsQueryKey.UpsertCurrentFlag]: {
    getUrl: getCurrentUserFlagUrl,
    method: HttpMethod.PUT,
  },
};

const userFlagsQueryKeys = {
  current: (userId: number | null, key: UserFlagKey) =>
    [UserFlagsQueryKey.GetCurrentFlag, userId, key] as const,
};

export { userFlagsApiConfig, UserFlagsQueryKey, userFlagsQueryKeys };
