/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Editor as EditorComponent } from 'modules.editor';
import type { Descendant } from 'slate';

// @ts-ignore
export const Editor = createFileRoute('/(app)/_layout/editor/')({
  component: EditorPage,
  beforeLoad: ({ context, location }) => {
    console.log('Calendar', context, location);
  },
});

// Начальное значение для редактора (пустой документ)
const initialValue: Descendant[] = [
  {
    id: '1',
    type: 'paragraph',
    children: [{ text: 'Начните писать здесь...' }],
  },
];

function EditorPage() {
  const [value, setValue] = useState<Descendant[]>(initialValue);

  const handleChange = (newValue: Descendant[]) => {
    setValue(newValue);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Тестовый редактор</h1>
      <div className="rounded-md border border-gray-300">
        <EditorComponent initialValue={value} onChange={handleChange} />
      </div>
    </div>
  );
}
