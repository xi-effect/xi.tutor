import {
  ClassroomMaterialsQueryKey,
  MaterialsQueryKey,
  materialsApiConfig,
  normalizeTagIds,
  TAG_ASSIGN_MAX_COUNT,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TagSchema } from 'common.api';
import { handleError } from '../utils';

export type SetMaterialTagsVars = {
  materialId: string;
  tagIds: number[];
};

export async function setMaterialTagsRequest({
  materialId,
  tagIds,
}: SetMaterialTagsVars): Promise<TagSchema[] | void> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = materialsApiConfig[MaterialsQueryKey.SetMaterialTags];
  const uniqueIds = normalizeTagIds(tagIds, TAG_ASSIGN_MAX_COUNT) ?? [];

  const response = await axiosInst<TagSchema[]>({
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

  return useMutation<TagSchema[] | void, Error, SetMaterialTagsVars>({
    mutationFn: setMaterialTagsRequest,
    onError: (err) => {
      handleError(err, 'materials');
    },
    onSuccess: (_data, { materialId }) => {
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
