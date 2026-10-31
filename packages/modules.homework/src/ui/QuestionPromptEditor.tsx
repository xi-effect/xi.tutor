import Image from '@tiptap/extension-image';
import { Mathematics } from '@tiptap/extension-mathematics';
import { TextAlign } from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extensions';
import type { EditorState } from '@tiptap/pm/state';
import { TextSelection } from '@tiptap/pm/state';
import { EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import {
  Add,
  AlignCentre,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Formula,
  H1,
  H2,
  H3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  Ol,
  Stroke,
  Text,
  Ul,
  Underline as UnderlineIcon,
} from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { insertPromptBlock, topLevelBlock, type PromptBlockKind } from './promptBlocks';
import './promptEditor.css';

const IMAGE_LIMIT = 300 * 1024;

const BLOCKS: { kind: PromptBlockKind; labelKey: string; Icon: typeof Text }[] = [
  { kind: 'paragraph', labelKey: 'blocks.text', Icon: Text },
  { kind: 'heading1', labelKey: 'blocks.heading1', Icon: H1 },
  { kind: 'heading2', labelKey: 'blocks.heading2', Icon: H2 },
  { kind: 'heading3', labelKey: 'blocks.heading3', Icon: H3 },
  { kind: 'bulletList', labelKey: 'toolbar.bullet', Icon: Ul },
  { kind: 'orderedList', labelKey: 'toolbar.ordered', Icon: Ol },
];

const ALIGNS = [
  { value: 'left', labelKey: 'align.left', Icon: AlignLeft },
  { value: 'center', labelKey: 'align.center', Icon: AlignCentre },
  { value: 'right', labelKey: 'align.right', Icon: AlignRight },
  { value: 'justify', labelKey: 'align.justify', Icon: AlignJustify },
] as const;

const menuItemClass =
  'text-text-primary hover:bg-background-page focus:text-text-primary h-7 gap-2 rounded p-1 text-sm [&_svg]:fill-icon-primary';

const menuContentClass =
  'border-border-default bg-background-surface text-text-primary flex w-auto flex-col gap-1 rounded-lg border p-2';

type QuestionPromptEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onReady?: () => void;
  placeholder?: string;
};

export type QuestionPromptEditorHandle = {
  insertBlock: (kind: PromptBlockKind) => boolean;
  pickImage: () => boolean;
  insertFormula: () => boolean;
};

const keepFocus = (event: MouseEvent) => {
  event.preventDefault();
};

const canShowBubble = (state: EditorState) => {
  const { selection } = state;
  if (!(selection instanceof TextSelection) || selection.empty) return false;
  try {
    const $from = state.doc.resolve(selection.from);
    const $to = state.doc.resolve(selection.to);
    return $from.parent.isTextblock && $to.parent.isTextblock;
  } catch {
    return false;
  }
};

const normalizeLink = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || /^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const FormatButton = ({
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
    aria-label={label}
    aria-pressed={active}
    className={cn(
      '[&_svg]:fill-icon-primary h-6 w-6 rounded-[2px] p-1 [&_svg]:size-4',
      active && 'bg-status-info-background [&_svg]:fill-icon-brand',
    )}
    onMouseDown={keepFocus}
    onClick={onClick}
  >
    {children}
  </Button>
);

export const QuestionPromptEditor = forwardRef<
  QuestionPromptEditorHandle,
  QuestionPromptEditorProps
>(function QuestionPromptEditor({ value, onChange, onReady, placeholder }, ref) {
  const { t } = useTranslation('homeworkEditor');
  const imageRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const [, setRevision] = useState(0);
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ allowBase64: true }),
      Placeholder.configure({ placeholder: placeholder ?? t('promptPlaceholder') }),
      Mathematics.configure({ katexOptions: { throwOnError: false } }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'homework-rich',
      },
    },
    onUpdate: ({ editor: current }) => onChangeRef.current(current.getHTML()),
    onTransaction: () => setRevision((revision) => revision + 1),
  });

  useImperativeHandle(
    ref,
    () => ({
      insertBlock: (kind) => {
        if (!editor) return false;
        insertPromptBlock(editor, kind, topLevelBlock(editor));
        return true;
      },
      pickImage: () => {
        if (!imageRef.current) return false;
        imageRef.current.click();
        return true;
      },
      insertFormula: () => {
        if (!editor) return false;
        window.setTimeout(() => {
          const latex = window.prompt(t('toolbar.formula'), '');
          if (!latex?.trim()) return;
          editor.chain().focus().insertInlineMath({ latex: latex.trim() }).run();
        }, 0);
        return true;
      },
    }),
    [editor, t],
  );

  useEffect(() => {
    if (editor) onReady?.();
  }, [editor, onReady]);

  if (!editor) {
    return <div className="min-h-16" />;
  }

  const currentAlign = () => {
    const heading = editor.getAttributes('heading').textAlign;
    const paragraph = editor.getAttributes('paragraph').textAlign;
    return ALIGNS.some((item) => item.value === heading)
      ? heading
      : ALIGNS.some((item) => item.value === paragraph)
        ? paragraph
        : 'left';
  };

  const toggleLink = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    const previous = String(editor.getAttributes('link').href ?? '');
    const url = window.prompt(t('toolbar.link'), previous || 'https://');
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: normalizeLink(url) })
      .run();
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

  const align = currentAlign();
  const AlignIcon = ALIGNS.find((item) => item.value === align)?.Icon ?? AlignLeft;

  return (
    <div>
      <BubbleMenu
        editor={editor}
        className="border-border-default bg-background-surface flex gap-1 rounded-lg border p-2 shadow-lg"
        shouldShow={({ state }) => canShowBubble(state)}
        options={{ placement: 'top' }}
      >
        <FormatButton
          label={t('toolbar.bold')}
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold />
        </FormatButton>
        <FormatButton
          label={t('toolbar.italic')}
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic />
        </FormatButton>
        <FormatButton
          label={t('toolbar.underline')}
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon />
        </FormatButton>
        <FormatButton
          label={t('toolbar.strike')}
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Stroke />
        </FormatButton>
        <FormatButton
          label={t('toolbar.link')}
          active={editor.isActive('link')}
          onClick={toggleLink}
        >
          <LinkIcon />
        </FormatButton>
        <span className="bg-border-default mx-0.5 w-px self-stretch" />
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="none"
              aria-label={t('align.menu')}
              className="[&_svg]:fill-icon-primary h-6 w-6 rounded-[2px] p-1 [&_svg]:size-4"
              onMouseDown={keepFocus}
            >
              <AlignIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={menuContentClass}
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            {ALIGNS.map(({ value, labelKey, Icon }) => (
              <DropdownMenuItem
                key={value}
                className={menuItemClass}
                onSelect={() => editor.chain().focus().setTextAlign(value).run()}
              >
                <Icon size="sm" className="size-5" />
                <span>{t(labelKey)}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </BubbleMenu>

      <EditorContent editor={editor} className="homework-prompt" />
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
  );
});

const handleButtonClass =
  'text-icon-secondary hover:bg-background-subtle hover:text-icon-primary data-[state=open]:bg-background-subtle data-[state=open]:text-icon-primary flex size-7 shrink-0 items-center justify-center rounded bg-transparent p-0';

export const PromptBlockMenu = ({
  open,
  onOpenChange,
  onAction,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: PromptBlockKind | 'image' | 'formula') => void;
}) => {
  const { t } = useTranslation('homeworkEditor');

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={t('addBlock')} className={handleButtonClass}>
          <Add className="size-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
        className={menuContentClass}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DropdownMenuLabel className="text-text-muted max-w-56 px-1 py-0.5 text-xs leading-snug font-normal">
          {t('blocks.hint')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {BLOCKS.map(({ kind, labelKey, Icon }) => (
          <DropdownMenuItem key={kind} className={menuItemClass} onSelect={() => onAction(kind)}>
            <Icon size="sm" className="size-6" />
            <span>{t(labelKey)}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem className={menuItemClass} onSelect={() => onAction('image')}>
          <ImageIcon size="sm" className="size-6" />
          <span>{t('toolbar.image')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className={menuItemClass} onSelect={() => onAction('formula')}>
          <Formula size="sm" className="size-6" />
          <span>{t('toolbar.formula')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
