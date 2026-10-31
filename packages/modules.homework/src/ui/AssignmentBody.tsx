import { cn } from '@xipkg/utils';
import { useRef, useState } from 'react';
import type { PromptBlockKind } from './promptBlocks';
import {
  PromptBlockMenu,
  QuestionPromptEditor,
  type QuestionPromptEditorHandle,
} from './QuestionPromptEditor';

type AssignmentBodyProps = {
  value: string;
  onChange: (html: string) => void;
};

const handleClass =
  'absolute top-1 left-0 flex items-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100';

export const AssignmentBody = ({ value, onChange }: AssignmentBodyProps) => {
  const editorRef = useRef<QuestionPromptEditorHandle>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const runBlock = (action: PromptBlockKind | 'image' | 'formula') => {
    const editor = editorRef.current;
    if (!editor) return;
    if (action === 'image') editor.pickImage();
    else if (action === 'formula') editor.insertFormula();
    else editor.insertBlock(action);
  };

  return (
    <div className="group relative pl-10">
      <div className={cn(handleClass, menuOpen && 'sm:opacity-100')}>
        <PromptBlockMenu open={menuOpen} onOpenChange={setMenuOpen} onAction={runBlock} />
      </div>
      <QuestionPromptEditor ref={editorRef} value={value} onChange={onChange} />
    </div>
  );
};
