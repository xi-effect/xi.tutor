import {
  parseUserFlagValue,
  userFlagsApiConfig,
  UserFlagsQueryKey,
  type UserFlagKey,
  type UserFlagValueSchema,
} from 'common.api';
import { getAxiosInstance } from 'common.config';

export async function updateCurrentUserFlag(key: UserFlagKey, value: boolean): Promise<boolean> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = userFlagsApiConfig[UserFlagsQueryKey.UpsertCurrentFlag];

  const response = await axiosInst<UserFlagValueSchema>({
    method,
    url: getUrl(key),
    data: { value } satisfies UserFlagValueSchema,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return parseUserFlagValue(response.data);
}
