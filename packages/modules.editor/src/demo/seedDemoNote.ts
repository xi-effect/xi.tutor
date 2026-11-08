import { getSchema, type JSONContent } from '@tiptap/core';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TextAlign } from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { buildDemoNoteDocument, readClassroomStorageItem } from 'common.services';
import { withCollabDocument } from 'modules.board/collab-session';
import { prosemirrorJSONToYXmlFragment } from 'y-prosemirror';

let noteSchema: ReturnType<typeof getSchema> | null = null;

const demoNoteSchema = () => {
  if (noteSchema) return noteSchema;
  noteSchema = getSchema([
    StarterKit.configure({
      undoRedo: false,
      horizontalRule: false,
      underline: false,
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
  ]);
  return noteSchema;
};

const boardHref = (classroomId: string, boardId: string | null): string | null => {
  if (!boardId || typeof window === 'undefined') return null;
  return `${window.location.origin}/classrooms/${classroomId}/boards/${boardId}`;
};

export const seedDemoNote = async (target: {
  classroomId: string;
  noteId: string;
  boardId: string | null;
}): Promise<void> => {
  const storage = await readClassroomStorageItem(target.classroomId, target.noteId);
  const document = buildDemoNoteDocument(boardHref(target.classroomId, target.boardId));

  await withCollabDocument(
    { ydocId: storage.ydocId, contentToken: storage.contentToken },
    (yDoc) => {
      const fragment = yDoc.getXmlFragment('default');
      if (fragment.length > 0) return;
      prosemirrorJSONToYXmlFragment(demoNoteSchema(), document as JSONContent, fragment);
    },
  );
};
