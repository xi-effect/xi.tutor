import {
  ClassroomFilesQueryKey,
  LibraryFilesQueryKey,
  libraryFilesApiConfig,
  normalizeTagIds,
  TAG_FILE_ASSIGN_MAX_COUNT,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleError } from '../utils';

export type SetFileTagsVars = {
  fileId: string;
  tagIds: number[];
};

type FileWithTagIds = {
  id?: string;
  tag_ids?: number[] | null;
};

const extractTagIds = (data: unknown, fallback: number[]): number[] => {
  if (data && typeof data === 'object' && 'tag_ids' in data) {
    const ids = (data as { tag_ids?: number[] | null }).tag_ids;
    if (Array.isArray(ids)) {
      return ids;
    }
  }

  return fallback;
};

const patchFileTagIds = (value: unknown, fileId: string, tagIds: number[]): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => patchFileTagIds(item, fileId, tagIds));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const record = value as FileWithTagIds & Record<string, unknown>;

  if (typeof record.id === 'string' && record.id === fileId) {
    return { ...record, tag_ids: tagIds };
  }

  if (Array.isArray(record.pages)) {
    return { ...record, pages: patchFileTagIds(record.pages, fileId, tagIds) };
  }

  if (Array.isArray(record.data)) {
    return { ...record, data: patchFileTagIds(record.data, fileId, tagIds) };
  }

  if (Array.isArray(record.results)) {
    return { ...record, results: patchFileTagIds(record.results, fileId, tagIds) };
  }

  return value;
};

export async function setFileTagsRequest({ fileId, tagIds }: SetFileTagsVars): Promise<unknown> {
  const axiosInst = await getAxiosInstance();
  const { getUrl, method } = libraryFilesApiConfig[LibraryFilesQueryKey.SetLibraryFileTags];
  const uniqueIds = normalizeTagIds(tagIds, TAG_FILE_ASSIGN_MAX_COUNT) ?? [];

  const response = await axiosInst({
    method,
    url: getUrl(fileId),
    data: { tag_ids: uniqueIds },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export const useSetFileTags = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, SetFileTagsVars>({
    mutationFn: setFileTagsRequest,
    onError: (err) => {
      handleError(err, 'files');
    },
    onSuccess: (data, { fileId, tagIds }) => {
      const nextIds = extractTagIds(data, normalizeTagIds(tagIds, TAG_FILE_ASSIGN_MAX_COUNT) ?? []);

      queryClient.setQueriesData(
        { queryKey: [LibraryFilesQueryKey.SearchLibraryFiles] },
        (current) => patchFileTagIds(current, fileId, nextIds),
      );
      queryClient.setQueriesData(
        { queryKey: [LibraryFilesQueryKey.GetLibraryFile, fileId] },
        (current) => patchFileTagIds(current, fileId, nextIds),
      );
      queryClient.setQueriesData(
        { queryKey: [LibraryFilesQueryKey.GetLibraryFileMeta, fileId] },
        (current) => patchFileTagIds(current, fileId, nextIds),
      );
      queryClient.setQueriesData(
        { queryKey: [ClassroomFilesQueryKey.SearchClassroomFilesTutor] },
        (current) => patchFileTagIds(current, fileId, nextIds),
      );
      queryClient.setQueriesData(
        { queryKey: [ClassroomFilesQueryKey.SearchClassroomFilesStudent] },
        (current) => patchFileTagIds(current, fileId, nextIds),
      );
      queryClient.setQueriesData(
        { queryKey: [ClassroomFilesQueryKey.GetClassroomFileTutor] },
        (current) => patchFileTagIds(current, fileId, nextIds),
      );
      queryClient.setQueriesData(
        { queryKey: [ClassroomFilesQueryKey.GetClassroomFileStudent] },
        (current) => patchFileTagIds(current, fileId, nextIds),
      );
      queryClient.setQueriesData(
        { queryKey: [ClassroomFilesQueryKey.GetClassroomFileMetaTutor] },
        (current) => patchFileTagIds(current, fileId, nextIds),
      );
      queryClient.setQueriesData(
        { queryKey: [ClassroomFilesQueryKey.GetClassroomFileMetaStudent] },
        (current) => patchFileTagIds(current, fileId, nextIds),
      );

      queryClient.invalidateQueries({ queryKey: [LibraryFilesQueryKey.GetLibraryFile, fileId] });
      queryClient.invalidateQueries({
        queryKey: [LibraryFilesQueryKey.GetLibraryFileMeta, fileId],
      });
      queryClient.invalidateQueries({ queryKey: [LibraryFilesQueryKey.SearchLibraryFiles] });
      queryClient.invalidateQueries({
        queryKey: [ClassroomFilesQueryKey.SearchClassroomFilesTutor],
      });
      queryClient.invalidateQueries({
        queryKey: [ClassroomFilesQueryKey.SearchClassroomFilesStudent],
      });
      queryClient.invalidateQueries({ queryKey: [ClassroomFilesQueryKey.GetClassroomFileTutor] });
      queryClient.invalidateQueries({ queryKey: [ClassroomFilesQueryKey.GetClassroomFileStudent] });
    },
  });
};
