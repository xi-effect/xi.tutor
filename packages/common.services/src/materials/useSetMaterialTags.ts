import {
  ClassroomMaterialsQueryKey,
  MaterialsQueryKey,
  materialsApiConfig,
  normalizeTagIds,
  TAG_ASSIGN_MAX_COUNT,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from '../utils';

export type SetMaterialTagsVars = {
  materialId: string;
  tagIds: number[];
};

type MaterialWithTagIds = {
  id?: string;
  tag_ids?: number[] | null;
};

const extractTagIds = (data: unknown, fallback: number[]): number[] => {
  if (Array.isArray(data)) {
    const fromTags = data
      .map((item) => (item && typeof item === 'object' && 'id' in item ? Number(item.id) : NaN))
      .filter((id) => Number.isInteger(id) && id > 0);
    if (fromTags.length > 0 || data.length === 0) {
      return fromTags;
    }
  }

  if (data && typeof data === 'object' && 'tag_ids' in data) {
    const ids = (data as { tag_ids?: number[] | null }).tag_ids;
    if (Array.isArray(ids)) {
      return ids;
    }
  }

  return fallback;
};

const patchMaterialTagIds = (value: unknown, materialId: string, tagIds: number[]): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => patchMaterialTagIds(item, materialId, tagIds));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const record = value as MaterialWithTagIds & Record<string, unknown>;

  if (typeof record.id === 'string' && record.id === materialId) {
    return { ...record, tag_ids: tagIds };
  }

  if (Array.isArray(record.pages)) {
    return { ...record, pages: patchMaterialTagIds(record.pages, materialId, tagIds) };
  }

  if (Array.isArray(record.data)) {
    return { ...record, data: patchMaterialTagIds(record.data, materialId, tagIds) };
  }

  if (Array.isArray(record.results)) {
    return { ...record, results: patchMaterialTagIds(record.results, materialId, tagIds) };
  }

  return value;
};

export async function setMaterialTagsRequest({
  materialId,
  tagIds,
}: SetMaterialTagsVars): Promise<unknown> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = materialsApiConfig[MaterialsQueryKey.SetMaterialTags];
  const uniqueIds = normalizeTagIds(tagIds, TAG_ASSIGN_MAX_COUNT) ?? [];

  const response = await axiosInst({
    method,
    url: getUrl(materialId),
    data: { tag_ids: uniqueIds },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export const useSetMaterialTags = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, SetMaterialTagsVars>({
    mutationFn: setMaterialTagsRequest,
    onError: (err) => {
      handleError(err, 'materials');
    },
    onSuccess: (data, { materialId, tagIds }) => {
      const nextIds = extractTagIds(data, normalizeTagIds(tagIds, TAG_ASSIGN_MAX_COUNT) ?? []);

      queryClient.setQueriesData({ queryKey: [MaterialsQueryKey.Materials] }, (current) =>
        patchMaterialTagIds(current, materialId, nextIds),
      );
      queryClient.setQueriesData(
        { queryKey: [MaterialsQueryKey.GetMaterial, materialId] },
        (current) => patchMaterialTagIds(current, materialId, nextIds),
      );
      queryClient.setQueriesData(
        { queryKey: [ClassroomMaterialsQueryKey.ClassroomMaterials] },
        (current) => patchMaterialTagIds(current, materialId, nextIds),
      );
      queryClient.setQueriesData(
        { queryKey: [ClassroomMaterialsQueryKey.ClassroomMaterialsStudent] },
        (current) => patchMaterialTagIds(current, materialId, nextIds),
      );
      queryClient.setQueriesData(
        { queryKey: [ClassroomMaterialsQueryKey.GetClassroomMaterial] },
        (current) => patchMaterialTagIds(current, materialId, nextIds),
      );
      queryClient.setQueriesData(
        { queryKey: [ClassroomMaterialsQueryKey.GetClassroomMaterialStudent] },
        (current) => patchMaterialTagIds(current, materialId, nextIds),
      );

      queryClient.invalidateQueries({ queryKey: [MaterialsQueryKey.GetMaterial, materialId] });
      queryClient.invalidateQueries({ queryKey: [MaterialsQueryKey.Materials] });
      queryClient.invalidateQueries({ queryKey: [ClassroomMaterialsQueryKey.ClassroomMaterials] });
      queryClient.invalidateQueries({
        queryKey: [ClassroomMaterialsQueryKey.ClassroomMaterialsStudent],
      });
      queryClient.invalidateQueries({
        queryKey: [ClassroomMaterialsQueryKey.GetClassroomMaterial],
      });
      queryClient.invalidateQueries({
        queryKey: [ClassroomMaterialsQueryKey.GetClassroomMaterialStudent],
      });
    },
  });
};
