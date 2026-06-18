const AVATAR_API_BASE = 'https://api.sovlium.ru/files/users';

export const getAvatarUrlByUserId = (id: number): string | undefined => {
  return `${AVATAR_API_BASE}/${id}/avatar.webp`;
};
