import Image from '@tiptap/extension-image';
import { Mathematics } from '@tiptap/extension-mathematics';
import { Placeholder } from '@tiptap/extensions';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@xipkg/button';
import {
  Bold,
  Formula,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  Stroke,
  Underline as UnderlineIcon,
} from '@xipkg/icons';
import { Input } from '@xipkg/input';
import { cn } from '@xipkg/utils';
import { useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import 'katex/dist/katex.min.css';
import './promptEditor.css';

const IMAGE_LIMIT = 300 * 1024;

type QuestionPromptEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

const ToolbarButton = ({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <Button
    type="button"
    variant="none"
    size="icon"
    aria-label={label}
    title={label}
    aria-pressed={active}
    className={cn('size-8 rounded-lg', active && 'bg-background-subtle')}
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
  >
    {children}
  </Button>
);

export const QuestionPromptEditor = ({ value, onChange }: QuestionPromptEditorProps) => {
  const { t } = useTranslation('homeworkEditor');
  const imageRef = useRef<HTMLInputElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState('');
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [formulaValue, setFormulaValue] = useState('');
  const [, setRevision] = useState(0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
      Image.configure({ allowBase64: true }),
      Placeholder.configure({ placeholder: t('promptPlaceholder') }),
      Mathematics.configure({ katexOptions: { throwOnError: false } }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'homework-rich text-text-primary min-h-24 px-3 py-2 text-sm leading-5 outline-none',
      },
    },
    onUpdate: ({ editor: current }) => onChangeRef.current(current.getHTML()),
    onTransaction: () => setRevision((revision) => revision + 1),
  });

  if (!editor) {
    return <div className="border-border-default min-h-24 rounded-xl border" />;
  }

  const applyLink = () => {
    const href = linkValue.trim();
    if (!href) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    setLinkOpen(false);
  };

  const applyFormula = () => {
    const latex = formulaValue.trim();
    if (latex) {
      editor.chain().focus().insertInlineMath({ latex }).run();
    }
    setFormulaValue('');
    setFormulaOpen(false);
  };

  const onImage = (file: File | undefined) => {
    if (!file) return;
    if (file.size > IMAGE_LIMIT) {
      toast(t('toolbar.imageTooLarge'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      editor.chain().focus().setImage({ src: reader.result }).run();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="border-border-default overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-center gap-0.5 px-1.5 py-1">
        <ToolbarButton
          label={t('toolbar.bold')}
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t('toolbar.italic')}
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t('toolbar.underline')}
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t('toolbar.strike')}
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Stroke className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t('toolbar.bullet')}
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <span className="text-sm leading-none">•</span>
        </ToolbarButton>
        <ToolbarButton
          label={t('toolbar.ordered')}
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <span className="text-xs leading-none">1.</span>
        </ToolbarButton>
        <ToolbarButton
          label={t('toolbar.link')}
          active={editor.isActive('link') || linkOpen}
          onClick={() => {
            setFormulaOpen(false);
            setLinkValue(String(editor.getAttributes('link').href ?? ''));
            setLinkOpen((open) => !open);
          }}
        >
          <LinkIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton label={t('toolbar.image')} onClick={() => imageRef.current?.click()}>
          <ImageIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label={t('toolbar.formula')}
          active={formulaOpen}
          onClick={() => {
            setLinkOpen(false);
            setFormulaOpen((open) => !open);
          }}
        >
          <Formula className="size-4" />
        </ToolbarButton>
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            onImage(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </div>

      {linkOpen ? (
        <form
          className="border-border-default flex gap-2 border-b px-2 py-2"
          onSubmit={(event) => {
            event.preventDefault();
            applyLink();
          }}
        >
          <Input
            value={linkValue}
            variant="s"
            placeholder={t('toolbar.linkPlaceholder')}
            aria-label={t('toolbar.link')}
            onChange={(event) => setLinkValue(event.target.value)}
          />
          <Button type="submit" variant="primary" size="s">
            {t('toolbar.apply')}
          </Button>
          <Button
            type="button"
            variant="none"
            size="s"
            onClick={() => editor.chain().focus().unsetLink().run()}
          >
            {t('toolbar.removeLink')}
          </Button>
        </form>
      ) : null}

      {formulaOpen ? (
        <form
          className="border-border-default flex gap-2 border-b px-2 py-2"
          onSubmit={(event) => {
            event.preventDefault();
            applyFormula();
          }}
        >
          <Input
            value={formulaValue}
            variant="s"
            placeholder={t('toolbar.formulaPlaceholder')}
            aria-label={t('toolbar.formula')}
            onChange={(event) => setFormulaValue(event.target.value)}
          />
          <Button type="submit" variant="primary" size="s">
            {t('toolbar.apply')}
          </Button>
        </form>
      ) : null}

      <EditorContent editor={editor} />
    </div>
  );
};
