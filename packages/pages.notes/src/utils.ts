import { env } from 'common.env';

export const getAvatarUrlByUserId = (id: number): string | undefined => {
  return `${env.VITE_SERVER_URL_BACKEND}/files/users/${id}/avatar.webp`;
};
