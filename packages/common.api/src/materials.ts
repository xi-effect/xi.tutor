import { env } from 'common.env';
import { HttpMethod } from './config';

enum MaterialsQueryKey {
  AddMaterials = 'AddMaterials',
}

const materialsApiConfig = {
  [MaterialsQueryKey.AddMaterials]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/materials/`,
    method: HttpMethod.POST,
  },
};

export { materialsApiConfig, MaterialsQueryKey };
