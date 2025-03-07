import { env } from 'common.config';
import { HttpMethod } from './config';

enum AuthQueryKey {
  Signin = 'Signin',
  Signup = 'Signup',
  Signout = 'Signout',
}

const authApiConfig = {
  [AuthQueryKey.Signin]: {
    getUrl: () => `${env.VITE_SERVER_URL_AUTH}/api/signin/`,
    method: HttpMethod.POST,
  },
  [AuthQueryKey.Signup]: {
    getUrl: () => `${env.VITE_SERVER_URL_AUTH}/api/signup/`,
    method: HttpMethod.POST,
  },
  [AuthQueryKey.Signout]: {
    getUrl: () => `${env.VITE_SERVER_URL_AUTH}/api/signout/`,
    method: HttpMethod.POST,
  },
};

export { authApiConfig, AuthQueryKey };
