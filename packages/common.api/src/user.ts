import { env } from 'common.env';
import { HttpMethod } from './config';

enum UserQueryKey {
  Home = 'Home',
  Profile = 'Profile',
  Email = 'Email',
  Password = 'Password',
  PasswordResetConfirm = 'PasswordResetConfirm',
  UserById = 'UserById',
}

const userApiConfig = {
  [UserQueryKey.Home]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/users/current/home/`,
    method: HttpMethod.GET,
  },
  [UserQueryKey.Profile]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/users/current/profile/`,
    method: HttpMethod.PATCH,
  },
  [UserQueryKey.Email]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/users/current/email/`,
    method: HttpMethod.PUT,
  },
  [UserQueryKey.Password]: {
    getUrl: () => `${env.VITE_SERVER_URL_BACKEND}/api/users/current/password/`,
    method: HttpMethod.PUT,
  },
  [UserQueryKey.PasswordResetConfirm]: {
    getUrl: () => `${env.VITE_SERVER_URL_AUTH}/api/password-reset/confirmations/`,
    method: HttpMethod.POST,
  },
  [UserQueryKey.UserById]: {
    getUrl: (id: string) => `${env.VITE_SERVER_URL_BACKEND}/api/users/by-id/${id}/profile/`,
    method: HttpMethod.GET,
  },
};

export { userApiConfig, UserQueryKey };
