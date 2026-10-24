const AVATAR_API_BASE = 'https://api.sovlium.ru/files/users';

/** Тот же контракт аватарки, что и в `CollaboratorAvatars` — по backend user id. */
export function getCommentAuthorAvatarUrl(authorId: string): string {
  return `${AVATAR_API_BASE}/${authorId}/avatar.webp`;
}
