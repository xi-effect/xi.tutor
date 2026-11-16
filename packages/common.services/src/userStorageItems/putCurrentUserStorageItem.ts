import {
  assertUserStorageItemKey,
  assertUserStorageItemValueSize,
  parseUserStorageItemValue,
  userStorageItemsApiConfig,
  UserStorageItemsQueryKey,
  type JsonValue,
  type UserStorageItemValueSchema,
} from 'common.api';
import { getAxiosInstance } from 'common.config';

export async function putCurrentUserStorageItem(key: string, value: JsonValue): Promise<JsonValue> {
  assertUserStorageItemKey(key);
  assertUserStorageItemValueSize(value);
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = userStorageItemsApiConfig[UserStorageItemsQueryKey.UpsertCurrentItem];

  const response = await axiosInst<UserStorageItemValueSchema>({
    method,
    url: getUrl(key),
    data: { value } satisfies UserStorageItemValueSchema,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return parseUserStorageItemValue(response.data);
}
