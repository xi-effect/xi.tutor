import {
  buildClassroomSearchRequest,
  classroomsApiConfig,
  ClassroomsQueryKey,
  type ClassroomCursor,
  type ClassroomFilters,
  type ClassroomT,
} from 'common.api';
import { getAxiosInstance } from 'common.config';

export async function searchTutorClassrooms(
  cursor: ClassroomCursor | null,
  limit?: number,
  filters?: ClassroomFilters | null,
): Promise<ClassroomT[]> {
  const axiosInst = await getAxiosInstance();
  const request = buildClassroomSearchRequest(cursor, limit, filters);

  const response = await axiosInst<ClassroomT[]>({
    method: classroomsApiConfig[ClassroomsQueryKey.SearchClassrooms].method,
    url: classroomsApiConfig[ClassroomsQueryKey.SearchClassrooms].getUrl(),
    data: request,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return Array.isArray(response.data) ? response.data : [];
}
