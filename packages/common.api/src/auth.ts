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
  [AuthQueryKey.RequestPasswordReset]: {
    getUrl: () => `${env.VITE_SERVER_URL_AUTH}/api/password-reset/requests/`,
    method: HttpMethod.POST,
  },
};

export { authApiConfig, AuthQueryKey };
