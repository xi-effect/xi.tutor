import { env } from 'common.env';
import { HttpMethod } from './config';

enum MaterialsQueryKey {
  Materials = 'Materials',
  AddMaterials = 'AddMaterials',
  DeleteMaterials = 'DeleteMaterials',
  GetMaterial = 'GetMaterial',
  UpdateMaterial = 'UpdateMaterial',
  StorageItem = 'StorageItem',
  MaterialDuplicates = 'MaterialDuplicates',
}

const materialsApiConfig = {
  [MaterialsQueryKey.Materials]: {
    getUrl: () => {
      return `${env.VITE_SERVER_URL_BACKEND}/api/protected/material-service/roles/tutor/materials/searches/`;
    },
    method: HttpMethod.POST,
  },

  [MaterialsQueryKey.AddMaterials]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/material-service/roles/tutor/materials/`,
    method: HttpMethod.POST,
  },

  [MaterialsQueryKey.DeleteMaterials]: {
    getUrl: (id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/material-service/roles/tutor/materials/${id}/`,
    method: HttpMethod.DELETE,
  },

  [MaterialsQueryKey.GetMaterial]: {
    getUrl: (id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/material-service/roles/tutor/materials/${id}/`,
    method: HttpMethod.GET,
  },
  [MaterialsQueryKey.UpdateMaterial]: {
    getUrl: (id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/material-service/roles/tutor/materials/${id}/`,
    method: HttpMethod.PATCH,
  },
  [MaterialsQueryKey.StorageItem]: {
    getUrl: (id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/material-service/roles/tutor/materials/${id}/storage-item/`,
    method: HttpMethod.GET,
  },
  [MaterialsQueryKey.MaterialDuplicates]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/material-service/roles/tutor/classrooms/${classroomId}/material-duplicates/`,
    method: HttpMethod.POST,
  },
};

export { materialsApiConfig, MaterialsQueryKey };
