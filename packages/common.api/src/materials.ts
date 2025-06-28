import { env } from 'common.env';
import { HttpMethod } from './config';

enum MaterialsQueryKey {
  Materials = 'Materials',
}

const materialsApiConfig = {
  [MaterialsQueryKey.Materials]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/materials/`,
    method: HttpMethod.POST,
  },
};

export { materialsApiConfig, MaterialsQueryKey };
