import {
  assertUserStorageItemKey,
  userStorageItemsApiConfig,
  UserStorageItemsQueryKey,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { isAxiosError } from 'axios';

/** 404 означает, что ключ уже удалён. */
export async function deleteCurrentUserStorageItem(key: string): Promise<void> {
  assertUserStorageItemKey(key);
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = userStorageItemsApiConfig[UserStorageItemsQueryKey.DeleteCurrentItem];

  try {
    await axiosInst({
      method,
      url: getUrl(key),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return;
    throw error;
  }
}
