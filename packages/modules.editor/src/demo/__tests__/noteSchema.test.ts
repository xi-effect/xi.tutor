import { getSchema, type JSONContent } from '@tiptap/core';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TextAlign } from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
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
]);

describe('документ демонстрационной заметки', () => {
  it('собирается схемой редактора вместе со ссылкой на доску', () => {
    const document = buildDemoNoteDocument('https://sovlium.ru/classrooms/7/boards/8');
    const node = Node.fromJSON(schema, document as JSONContent);

    expect(node.textContent).toContain('Знакомство с продуктом');
    expect(node.textContent).toContain('Демонстрационная доска');
    expect(JSON.stringify(document)).toContain('https://sovlium.ru/classrooms/7/boards/8');
  });
});
