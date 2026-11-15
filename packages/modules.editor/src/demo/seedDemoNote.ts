import { getSchema, type JSONContent } from '@tiptap/core';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TextAlign } from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import {
  DEMO_CABINET_NOTE_COPY,
  DEMO_SAMPLE_PDF,
  buildDemoNoteDocument,
  isPublicAssetSrc,
  readClassroomStorageItem,
} from 'common.services';
import { withCollabDocument } from 'modules.board/collab-session';
import { prosemirrorJSONToYXmlFragment } from 'y-prosemirror';
import * as Y from 'yjs';
import { ActivityNode } from '../extensions/activity/ActivityNode';
import { PdfNode } from '../extensions/pdf/PdfNode';

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
    ActivityNode,
    PdfNode,
  ]);
  return noteSchema;
};

const elementText = (element: Y.XmlElement): string => {
  let value = '';
  for (let index = 0; index < element.length; index += 1) {
    const child = element.get(index);
    if (child instanceof Y.XmlText) value += child.toString();
    else if (child instanceof Y.XmlElement) value += elementText(child);
  }
  return value;
};

const fragmentText = (fragment: Y.XmlFragment): string => {
  let value = '';
  for (let index = 0; index < fragment.length; index += 1) {
    const child = fragment.get(index);
    if (child instanceof Y.XmlText) value += child.toString();
    else if (child instanceof Y.XmlElement) value += elementText(child);
  }
  return value;
};

const fragmentHasSamplePdf = (fragment: Y.XmlFragment): boolean => {
  const walk = (element: Y.XmlElement): boolean => {
    const src = element.getAttribute('src');
    if (element.nodeName === 'pdf' && isPublicAssetSrc(typeof src === 'string' ? src : ''))
      return true;
    for (let index = 0; index < element.length; index += 1) {
      const child = element.get(index);
      if (child instanceof Y.XmlElement && walk(child)) return true;
    }
    return false;
  };

  for (let index = 0; index < fragment.length; index += 1) {
    const child = fragment.get(index);
    if (child instanceof Y.XmlElement && walk(child)) return true;
  }
  return false;
};

const xmlText = (value: string): Y.XmlText => {
  const node = new Y.XmlText();
  node.insert(0, value);
  return node;
};

const xmlElement = (
  name: string,
  attrs: Record<string, string | number>,
  children: Array<Y.XmlElement | Y.XmlText>,
): Y.XmlElement => {
  const node = new Y.XmlElement(name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  if (children.length > 0) node.insert(0, children);
  return node;
};

/** Пустой документ редактора — это один или несколько абзацев без текста. Его можно заменить шаблоном. */
const isBlankNote = (fragment: Y.XmlFragment): boolean => {
  if (fragment.length === 0) return true;
  for (let index = 0; index < fragment.length; index += 1) {
    const child = fragment.get(index);
    if (!(child instanceof Y.XmlElement) || child.nodeName !== 'paragraph') return false;
    if (elementText(child).trim()) return false;
  }
  return true;
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
      const replace =
        isBlankNote(fragment) || fragmentText(fragment).includes('Знакомство с заметкой');
      if (replace) {
        if (fragmentHasSamplePdf(fragment)) return;
        if (fragment.length > 0) fragment.delete(0, fragment.length);
        prosemirrorJSONToYXmlFragment(demoNoteSchema(), document as JSONContent, fragment);
        return;
      }
      if (fragmentHasSamplePdf(fragment)) return;
      fragment.insert(fragment.length, [
        xmlElement('heading', { level: 2 }, [xmlText(DEMO_CABINET_NOTE_COPY.filesTitle)]),
        xmlElement('paragraph', {}, [xmlText(DEMO_CABINET_NOTE_COPY.filesBody)]),
        xmlElement(
          'pdf',
          {
            src: DEMO_SAMPLE_PDF.path,
            fileName: DEMO_SAMPLE_PDF.fileName,
            totalPages: DEMO_SAMPLE_PDF.totalPages,
          },
          [],
        ),
      ]);
    },
  );
};
