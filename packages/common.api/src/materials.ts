import { env } from 'common.env';
import { HttpMethod } from './config';
import { MaterialsKindT } from './types';

enum MaterialsQueryKey {
  Materials = 'Materials',
}

const materialsApiConfig = {
  [MaterialsQueryKey.Materials]: {
    getUrl: (limit: number, kind: MaterialsKindT, lastOpenedBefore?: string) => {
      const params = new URLSearchParams({ limit: String(limit), kind });

      if (lastOpenedBefore) {
        params.set('last_opened_before', lastOpenedBefore);
      }

      return `${env.VITE_SERVER_URL_BACKEND}/api/protected/tutor-service/materials/?${params.toString()}`;
    },
    method: HttpMethod.GET,
  },
};

export { materialsApiConfig, MaterialsQueryKey };
