import { env } from 'common.env';
import { HttpMethod } from './config';

enum SubjectsQueryKey {
  GetSubjectById = 'GetSubjectById',
  SubjectsAutocomplete = 'SubjectsAutocomplete',
}

const subjectsApiConfig = {
  [SubjectsQueryKey.GetSubjectById]: {
    getUrl: (id: number) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/autocomplete-service/subjects/${id}/`,
    method: HttpMethod.GET,
  },
  [SubjectsQueryKey.SubjectsAutocomplete]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/autocomplete-service/subjects/autocomplete-suggestions/`,
    method: HttpMethod.GET,
  },
};

export { subjectsApiConfig, SubjectsQueryKey };
