import { env } from 'common.env';
import { HttpMethod } from './config';

enum AuthQueryKey {
  Signin = 'Signin',
  Signup = 'Signup',
  Signout = 'Signout',
  RequestPasswordReset = 'RequestPasswordReset',
}

const authApiConfig = {
  [AuthQueryKey.Signin]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/public/user-service/signin/`,
    method: HttpMethod.POST,
  },
  [AuthQueryKey.Signup]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/public/user-service/signup/`,
    method: HttpMethod.POST,
  },
  [AuthQueryKey.Signout]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/protected/user-service/sessions/current/`,
    method: HttpMethod.DELETE,
  },
  [AuthQueryKey.RequestPasswordReset]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/public/user-service/password-reset/requests/`,
    method: HttpMethod.POST,
  },
};

export { authApiConfig, AuthQueryKey };
