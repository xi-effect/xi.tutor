export const getUserAvatarUrl = (userId?: number | string | null) => {
  if (!userId) {
    return;
  }

  return `https://api.sovlium.ru/files/users/${userId}/avatar.webp`;
};
