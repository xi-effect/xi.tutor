import { useCurrentUser } from 'common.services';
import type { NewCommentAuthor } from './commentQueries';

/** Данные автора для новых комментариев/ответов — снимок имени на момент отправки. */
export function useCommentAuthor(): NewCommentAuthor | null {
  const { data: currentUser } = useCurrentUser();
  if (currentUser?.id == null) return null;

  return {
    authorId: String(currentUser.id),
    authorName: currentUser.display_name || currentUser.username || 'Пользователь',
  };
}
