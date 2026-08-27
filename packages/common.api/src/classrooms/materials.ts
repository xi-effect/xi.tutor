import { env } from 'common.env';
import { HttpMethod } from '../config';

const CONTENT_SERVICE_URL = `${env.VITE_SERVER_URL_BACKEND}/api/protected/content-service`;

enum ClassroomMaterialsQueryKey {
  ClassroomMaterials = 'ClassroomMaterials',
  AddClassroomMaterials = 'AddClassroomMaterials',
  DeleteClassroomMaterials = 'DeleteClassroomMaterials',
  GetClassroomMaterial = 'GetClassroomMaterial',
  UpdateClassroomMaterial = 'UpdateClassroomMaterial',
  ClassroomMaterialsStudent = 'ClassroomMaterialsStudent',
  GetClassroomMaterialStudent = 'GetClassroomMaterialStudent',
  ClassroomStorageItem = 'ClassroomStorageItem',
  ClassroomStorageItemStudent = 'ClassroomStorageItemStudent',
}

const classroomMaterialsApiConfig = {
  [ClassroomMaterialsQueryKey.ClassroomMaterials]: {
    getUrl: (classroomId: string) =>
      `${CONTENT_SERVICE_URL}/roles/tutor/classrooms/${classroomId}/materials/searches/`,
    method: HttpMethod.POST,
  },

  [ClassroomMaterialsQueryKey.AddClassroomMaterials]: {
    getUrl: (classroomId: string) =>
      `${CONTENT_SERVICE_URL}/roles/tutor/classrooms/${classroomId}/materials/`,
    method: HttpMethod.POST,
  },

  [ClassroomMaterialsQueryKey.DeleteClassroomMaterials]: {
    getUrl: (classroomId: string, id: string) =>
      `${CONTENT_SERVICE_URL}/roles/tutor/classrooms/${classroomId}/materials/${id}/`,
    method: HttpMethod.DELETE,
  },

  [ClassroomMaterialsQueryKey.GetClassroomMaterial]: {
    getUrl: (classroomId: string, id: string) =>
      `${CONTENT_SERVICE_URL}/roles/tutor/classrooms/${classroomId}/materials/${id}/`,
    method: HttpMethod.GET,
  },

  [ClassroomMaterialsQueryKey.UpdateClassroomMaterial]: {
    getUrl: (classroomId: string, id: string) =>
      `${CONTENT_SERVICE_URL}/roles/tutor/classrooms/${classroomId}/materials/${id}/`,
    method: HttpMethod.PATCH,
  },
  [ClassroomMaterialsQueryKey.ClassroomMaterialsStudent]: {
    getUrl: (classroomId: string) =>
      `${CONTENT_SERVICE_URL}/roles/student/classrooms/${classroomId}/materials/searches/`,
    method: HttpMethod.POST,
  },
  [ClassroomMaterialsQueryKey.GetClassroomMaterialStudent]: {
    getUrl: (classroomId: string, id: string) =>
      `${CONTENT_SERVICE_URL}/roles/student/classrooms/${classroomId}/materials/${id}/`,
    method: HttpMethod.GET,
  },
  [ClassroomMaterialsQueryKey.ClassroomStorageItem]: {
    getUrl: (classroomId: string, id: string) =>
      `${CONTENT_SERVICE_URL}/roles/tutor/classrooms/${classroomId}/materials/${id}/storage-item/`,
    method: HttpMethod.GET,
  },
  [ClassroomMaterialsQueryKey.ClassroomStorageItemStudent]: {
    getUrl: (classroomId: string, id: string) =>
      `${CONTENT_SERVICE_URL}/roles/student/classrooms/${classroomId}/materials/${id}/storage-item/`,
    method: HttpMethod.GET,
  },
};

export { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey };
