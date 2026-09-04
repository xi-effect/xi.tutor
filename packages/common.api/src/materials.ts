import { env } from 'common.env';
import { HttpMethod } from './config';

const CONTENT_SERVICE_URL = `${env.VITE_SERVER_URL_BACKEND}/api/protected/content-service`;

enum MaterialsQueryKey {
  Materials = 'Materials',
  AddMaterials = 'AddMaterials',
  DeleteMaterials = 'DeleteMaterials',
  GetMaterial = 'GetMaterial',
  UpdateMaterial = 'UpdateMaterial',
  SetMaterialTags = 'SetMaterialTags',
  StorageItem = 'StorageItem',
  MaterialDuplicates = 'MaterialDuplicates',
}

const materialsApiConfig = {
  [MaterialsQueryKey.Materials]: {
    getUrl: () => `${CONTENT_SERVICE_URL}/roles/tutor/materials/searches/`,
    method: HttpMethod.POST,
  },

  [MaterialsQueryKey.AddMaterials]: {
    getUrl: () => `${CONTENT_SERVICE_URL}/roles/tutor/personal-materials/`,
    method: HttpMethod.POST,
  },

  [MaterialsQueryKey.DeleteMaterials]: {
    getUrl: (id: string) => `${CONTENT_SERVICE_URL}/roles/tutor/personal-materials/${id}/`,
    method: HttpMethod.DELETE,
  },

  [MaterialsQueryKey.GetMaterial]: {
    getUrl: (id: string) => `${CONTENT_SERVICE_URL}/roles/tutor/personal-materials/${id}/`,
    method: HttpMethod.GET,
  },
  [MaterialsQueryKey.UpdateMaterial]: {
    getUrl: (id: string) => `${CONTENT_SERVICE_URL}/roles/tutor/personal-materials/${id}/`,
    method: HttpMethod.PATCH,
  },
  [MaterialsQueryKey.SetMaterialTags]: {
    getUrl: (id: string) => `${CONTENT_SERVICE_URL}/roles/tutor/materials/${id}/tags/`,
    method: HttpMethod.PUT,
  },
  [MaterialsQueryKey.StorageItem]: {
    getUrl: (id: string) =>
      `${CONTENT_SERVICE_URL}/roles/tutor/personal-materials/${id}/storage-item/`,
    method: HttpMethod.GET,
  },
  [MaterialsQueryKey.MaterialDuplicates]: {
    getUrl: (classroomId: string, shouldCopyTags = true) => {
      const params = new URLSearchParams({
        should_copy_tags: String(shouldCopyTags),
      });
      return `${CONTENT_SERVICE_URL}/roles/tutor/classrooms/${classroomId}/material-duplicates/?${params.toString()}`;
    },
    method: HttpMethod.POST,
  },
};

export { materialsApiConfig, MaterialsQueryKey };
