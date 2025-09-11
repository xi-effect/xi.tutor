import { env } from 'common.env';
import { HttpMethod } from './config';
import { MaterialsKindT } from './types';

enum MaterialsQueryKey {
  Materials = 'Materials',
  AddMaterials = 'AddMaterials',
  DeleteMaterials = 'DeleteMaterials',
  GetMaterial = 'GetMaterial',
  UpdateMaterial = 'UpdateMaterial',
}

const materialsApiConfig = {
  [MaterialsQueryKey.Materials]: {
    getUrl: (limit: number, kind: MaterialsKindT, lastOpenedBefore?: string) => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        kind,
      });

      if (lastOpenedBefore) {
        params.append('last_opened_before', lastOpenedBefore);
      }

      return `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/materials/?${params.toString()}`;
    },
    method: HttpMethod.GET,
  },

  [MaterialsQueryKey.AddMaterials]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/materials/`,
    method: HttpMethod.POST,
  },

  [MaterialsQueryKey.DeleteMaterials]: {
    getUrl: (id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/materials/${id}/`,
    method: HttpMethod.DELETE,
  },

  [MaterialsQueryKey.GetMaterial]: {
    getUrl: (id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/materials/${id}/`,
    method: HttpMethod.GET,
  },

  [MaterialsQueryKey.UpdateMaterial]: {
    getUrl: (id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/classroom-service/roles/tutor/materials/${id}/`,
    method: HttpMethod.PATCH,
  },
};

export { materialsApiConfig, MaterialsQueryKey };
