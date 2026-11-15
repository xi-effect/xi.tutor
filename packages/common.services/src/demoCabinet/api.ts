import {
  ClassroomMaterialsQueryKey,
  ClassroomsQueryKey,
  classroomMaterialsApiConfig,
  classroomsApiConfig,
} from 'common.api';
import { getAxiosInstance } from 'common.config';
import { isAxiosError } from 'axios';
import { preventStorageWrite } from '../storageLimit/storageLimitReached';
import { DemoCabinetError } from './errors';
import { readCreatedId } from './ids';
import { DEMO_CABINET_NAMES } from './template';

const jsonHeaders = {
  'Content-Type': 'application/json',
};

const isNotFound = (error: unknown): boolean =>
  isAxiosError(error) && error.response?.status === 404;

export const createDemoGroupClassroom = async (): Promise<string> => {
  const axiosInst = await getAxiosInstance();
  const response = await axiosInst({
    method: classroomsApiConfig[ClassroomsQueryKey.CreateGroupClassroom].method,
    url: classroomsApiConfig[ClassroomsQueryKey.CreateGroupClassroom].getUrl(),
    data: {
      name: DEMO_CABINET_NAMES.classroom,
      subject_id: null,
    },
    headers: jsonHeaders,
  });

  return readCreatedId(response.data);
};

const createClassroomMaterial = async (
  classroomId: string,
  contentKind: 'board' | 'note',
  name: string,
): Promise<string> => {
  preventStorageWrite();

  const axiosInst = await getAxiosInstance();
  const response = await axiosInst({
    method: classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.AddClassroomMaterials].method,
    url: classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.AddClassroomMaterials].getUrl(
      classroomId,
    ),
    data: {
      content_kind: contentKind,
      name,
      student_access_mode: 'read_write',
    },
    headers: jsonHeaders,
  });

  return readCreatedId(response.data);
};

export const createDemoBoard = (classroomId: string): Promise<string> =>
  createClassroomMaterial(classroomId, 'board', DEMO_CABINET_NAMES.board);

export const createDemoNote = (classroomId: string): Promise<string> =>
  createClassroomMaterial(classroomId, 'note', DEMO_CABINET_NAMES.note);

export const demoClassroomExists = async (classroomId: string): Promise<boolean> => {
  try {
    const axiosInst = await getAxiosInstance();
    await axiosInst({
      method: classroomsApiConfig[ClassroomsQueryKey.GetClassroom].method,
      url: classroomsApiConfig[ClassroomsQueryKey.GetClassroom].getUrl(classroomId),
      headers: jsonHeaders,
    });
    return true;
  } catch (error) {
    if (isNotFound(error)) return false;
    throw error;
  }
};

export const demoMaterialExists = async (
  classroomId: string,
  materialId: string,
): Promise<boolean> => {
  try {
    const axiosInst = await getAxiosInstance();
    await axiosInst({
      method: classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.GetClassroomMaterial].method,
      url: classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.GetClassroomMaterial].getUrl(
        classroomId,
        materialId,
      ),
      headers: jsonHeaders,
    });
    return true;
  } catch (error) {
    if (isNotFound(error)) return false;
    throw error;
  }
};

export const readClassroomStorageItem = async (
  classroomId: string,
  materialId: string,
): Promise<{ ydocId: string; contentToken: string }> => {
  const axiosInst = await getAxiosInstance();
  const response = await axiosInst({
    method: classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.ClassroomStorageItem].method,
    url: classroomMaterialsApiConfig[ClassroomMaterialsQueryKey.ClassroomStorageItem].getUrl(
      classroomId,
      materialId,
    ),
    headers: jsonHeaders,
  });

  const body = response.data as {
    ydoc_id?: unknown;
    content_token?: unknown;
    data?: { ydoc_id?: unknown; content_token?: unknown };
  };
  const source = typeof body?.ydoc_id === 'string' ? body : body?.data;
  if (
    !source ||
    typeof source.ydoc_id !== 'string' ||
    !source.ydoc_id ||
    typeof source.content_token !== 'string' ||
    !source.content_token
  ) {
    throw new DemoCabinetError('storage-item');
  }

  return { ydocId: source.ydoc_id, contentToken: source.content_token };
};
