import {
  parseUserFlagValue,
  userFlagsApiConfig,
  UserFlagsQueryKey,
  type UserFlagKey,
  type UserFlagValueSchema,
} from 'common.api';
import { getAxiosInstance } from 'common.config';

export async function getCurrentUserFlag(key: UserFlagKey): Promise<boolean> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = userFlagsApiConfig[UserFlagsQueryKey.GetCurrentFlag];

  const response = await axiosInst<UserFlagValueSchema>({
    method,
    url: getUrl(key),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return parseUserFlagValue(response.data);
}
