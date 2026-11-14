import { getSchema, type JSONContent } from '@tiptap/core';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { ActivityNode } from '../../extensions/activity/ActivityNode';
import { TextAlign } from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import { Node as TiptapNode } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import { buildDemoNoteDocument } from 'common.services';
import { describe, expect, it } from 'vitest';

const schema = getSchema([
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
  TiptapNode.create({
    name: 'pdf',
    group: 'block',
    atom: true,
    addAttributes() {
      return {
        src: { default: '' },
        fileName: { default: '' },
        totalPages: { default: 1 },
        annotations: { default: {} },
      };
    },
  }),
]);

describe('документ демонстрационной заметки', () => {
  it('собирается схемой редактора вместе со ссылкой на доску', () => {
    const document = buildDemoNoteDocument('https://sovlium.ru/classrooms/7/boards/8');
    const node = Node.fromJSON(schema, document as JSONContent);

    expect(node.textContent).toContain('Знакомство с заметкой');
    expect(node.textContent).toContain('демонстрационную доску');
    expect(JSON.stringify(document)).toContain('Пропуск в тексте');
    expect(node.textContent).toContain('двухстраничный PDF');
    expect(JSON.stringify(document)).toContain('https://sovlium.ru/classrooms/7/boards/8');
    expect(JSON.stringify(document)).toContain('"kind":"gap-text"');
    expect(JSON.stringify(document)).toContain('"kind":"label-image"');
    expect(JSON.stringify(document)).toContain('/assets/test_recipes_2_pages.pdf');
  });
});
