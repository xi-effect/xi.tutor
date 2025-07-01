import { env } from 'common.env';
import { HttpMethod } from './config';

enum UserQueryKey {
  Home = 'Home',
  Profile = 'Profile',
  Email = 'Email',
  Password = 'Password',
  PasswordResetConfirm = 'PasswordResetConfirm',
  UserById = 'UserById',
  ChangeRole = 'ChangeRole',
}

const userApiConfig = {
  [UserQueryKey.Home]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/protected/user-service/users/current/home/`,
    method: HttpMethod.GET,
  },
  [UserQueryKey.Profile]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/user-service/users/current/profile/`,
    method: HttpMethod.PATCH,
  },
  [UserQueryKey.Email]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/protected/user-service/users/current/email/`,
    method: HttpMethod.PUT,
  },
  [UserQueryKey.Password]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/user-service/users/current/password/`,
    method: HttpMethod.PUT,
  },
  [UserQueryKey.PasswordResetConfirm]: {
    getUrl: () =>
      `${env.VITE_SERVER_URL_BACKEND}/api/public/user-service/password-reset/confirmations/`,
    method: HttpMethod.POST,
  },
  [UserQueryKey.UserById]: {
    getUrl: (id: string) =>
      `${env.VITE_SERVER_URL_BACKEND}/api/protected/user-service/users/by-id/${id}/profile/`,
    method: HttpMethod.GET,
  },

  //TODO: check URL
  [UserQueryKey.ChangeRole]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/protected/user-service/users/current/role/`,
    method: HttpMethod.PATCH,
  },
};

export { userApiConfig, UserQueryKey };
