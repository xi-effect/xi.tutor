/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { useState, Suspense, lazy } from 'react';
import type { Descendant } from 'slate';

const Editor = lazy(() => import('modules.editor').then((module) => ({ default: module.Editor })));

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/editor/')({
  component: EditorPage,
  beforeLoad: ({ context, location }) => {
    console.log('Editor', context, location);
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
      <div className="h-[500px]">
        <Suspense fallback={<LoadingScreen />}>
          <Editor initialValue={value} onChange={handleChange} />
        </Suspense>
      </div>
    </div>
  );
}
