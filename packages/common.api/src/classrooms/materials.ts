import { env } from 'common.env';
import { HttpMethod } from '../config';

enum ClassroomMaterialsQueryKey {
  ClassroomMaterials = 'ClassroomMaterials',
  AddClassroomMaterials = 'AddClassroomMaterials',
  DeleteClassroomMaterials = 'DeleteClassroomMaterials',
  GetClassroomMaterial = 'GetClassroomMaterial',
  UpdateClassroomMaterial = 'UpdateClassroomMaterial',
  ClassroomMaterialsStudent = 'ClassroomMaterialsStudent',
  GetClassroomMaterialStudent = 'GetClassroomMaterialStudent',
}

const classroomMaterialsApiConfig = {
  [ClassroomMaterialsQueryKey.ClassroomMaterials]: {
    getUrl: (classroomId: string) => {
      return `${env.VITE_SERVER_URL_BACKEND}/api/protected/material-service/roles/tutor/classrooms/${classroomId}/materials/searches/`;
    },
    method: HttpMethod.POST,
  },

  [ClassroomMaterialsQueryKey.AddClassroomMaterials]: {
    getUrl: (classroomId: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/material-service/roles/tutor/classrooms/${classroomId}/materials/`,
    method: HttpMethod.POST,
  },

  [ClassroomMaterialsQueryKey.DeleteClassroomMaterials]: {
    getUrl: (classroomId: string, id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/material-service/roles/tutor/classrooms/${classroomId}/materials/${id}/`,
    method: HttpMethod.DELETE,
  },

  [ClassroomMaterialsQueryKey.GetClassroomMaterial]: {
    getUrl: (classroomId: string, id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/material-service/roles/tutor/classrooms/${classroomId}/materials/${id}/`,
    method: HttpMethod.GET,
  },

  [ClassroomMaterialsQueryKey.UpdateClassroomMaterial]: {
    getUrl: (classroomId: string, id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/material-service/roles/tutor/classrooms/${classroomId}/materials/${id}/`,
    method: HttpMethod.PATCH,
  },
  [ClassroomMaterialsQueryKey.ClassroomMaterialsStudent]: {
    getUrl: (classroomId: string) => {
      return `${env.VITE_SERVER_URL_BACKEND}/api/protected/material-service/roles/student/classrooms/${classroomId}/materials/searches/`;
    },
    method: HttpMethod.POST,
  },
  [ClassroomMaterialsQueryKey.GetClassroomMaterialStudent]: {
    getUrl: (classroomId: string, id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/material-service/roles/student/classrooms/${classroomId}/materials/${id}/`,
    method: HttpMethod.GET,
  },
};

export { classroomMaterialsApiConfig, ClassroomMaterialsQueryKey };
