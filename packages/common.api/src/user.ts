import { env } from 'common.env';
import { HttpMethod } from './config';

enum UserQueryKey {
  Home = 'Home',
  Profile = 'Profile',
  Email = 'Email',
  Password = 'Password',
}

const userApiConfig = {
  [UserQueryKey.Home]: {
    getUrl: () => `${env.VITE_SERVER_URL_AUTH}/api/users/current/home/`,
    method: HttpMethod.GET,
  },
  [UserQueryKey.Profile]: {
    getUrl: () => `${env.VITE_SERVER_URL_AUTH}/api/users/current/profile/`,
    method: HttpMethod.POST,
  },
  [UserQueryKey.Email]: {
    getUrl: () => `${env.VITE_SERVER_URL_AUTH}/api/users/current/email/`,
    method: HttpMethod.PUT,
  },
  [UserQueryKey.Password]: {
    getUrl: () => `${env.VITE_SERVER_URL_AUTH}/api/users/current/password/`,
    method: HttpMethod.PUT,
  },
};

export { userApiConfig, UserQueryKey };
