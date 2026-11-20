import {
  assertUserStorageItemKey,
  parseUserStorageItemValue,
  userStorageItemsApiConfig,
  UserStorageItemsQueryKey,
  type JsonValue,
  type UserStorageItemValueSchema,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { isAxiosError } from 'axios';

/** `null`, если ключа ещё нет (404). Остальные ошибки пробрасывает. */
export async function getCurrentUserStorageItem(key: string): Promise<JsonValue | null> {
  assertUserStorageItemKey(key);
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = userStorageItemsApiConfig[UserStorageItemsQueryKey.GetCurrentItem];

  try {
    const response = await axiosInst<UserStorageItemValueSchema>({
      method,
      url: getUrl(key),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return parseUserStorageItemValue(response.data);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}
