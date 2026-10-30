import { mergeCollaboratorCursorLayout, track, useEditor } from '@ibodr/draw';
import { useCurrentUser } from 'common.services';
import { useYjsContext } from '../../../providers/YjsProvider';
import { CollaboratorCursor } from './CollaboratorCursor';
import { selectCursorPresences } from './cursorPresences';

const cursorLayout = mergeCollaboratorCursorLayout();

/** Слой курсоров доски: без своих сессий и без дублей одного пользователя. */
export const BoardCollaboratorCursors = track(function BoardCollaboratorCursors() {
  const editor = useEditor();
  const { myPresenceId } = useYjsContext();
  const { data: currentUser } = useCurrentUser();
  const container = editor.getContainer();
  const containerRect = container.getBoundingClientRect();
  const myBackendUserId = currentUser?.id != null ? String(currentUser.id) : null;

  const presences = selectCursorPresences(editor.getVisibleCollaboratorsOnCurrentPage(), {
    myPresenceId,
    myUserId: editor.user.getRecordId(),
    myBackendUserId,
  });

  return (
    <>
      {presences.map((presence) => {
        if (!presence.cursor) return null;
        const screenPoint = editor.pageToScreen(presence.cursor);
        const name =
          presence.userName && presence.userName !== 'New User' ? presence.userName : null;
        return (
          <CollaboratorCursor
            key={presence.userId}
            point={{
              x: screenPoint.x - containerRect.left,
              y: screenPoint.y - containerRect.top,
            }}
            color={presence.color}
            name={name}
            chatMessage={presence.chatMessage || undefined}
            scale={1}
            layout={cursorLayout}
          />
        );
      })}
    </>
  );
});
