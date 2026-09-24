import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import type { Editor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Button } from '@xipkg/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@xipkg/dropdown';
import { AlignCentre, AlignJustify, AlignLeft, AlignRight } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import type { ActiveBlockT } from '../../types';

export const TEXT_ALIGNS = ['left', 'center', 'right', 'justify'] as const;
export type TextAlignValue = (typeof TEXT_ALIGNS)[number];

const ALIGN_ICONS = {
  left: AlignLeft,
  center: AlignCentre,
  right: AlignRight,
  justify: AlignJustify,
} as const;

const ALIGNABLE_NODE = new Set(['paragraph', 'heading']);

function keepEditorFocus(event: MouseEvent) {
  event.preventDefault();
}

function isAlignValue(value: unknown): value is TextAlignValue {
  return value === 'left' || value === 'center' || value === 'right' || value === 'justify';
}

function nodeAlign(node: ProseMirrorNode): string {
  const value = node.attrs.textAlign;
  return isAlignValue(value) ? value : 'left';
}

export function isAlignableTextBlock(node: ProseMirrorNode | null | undefined): boolean {
  if (!node) return false;
  if (ALIGNABLE_NODE.has(node.type.name)) return true;

  let found = false;
  node.descendants((child) => {
    if (!ALIGNABLE_NODE.has(child.type.name)) return;
    found = true;
    return false;
  });
  return found;
}

export function readNodeTextAlign(node: ProseMirrorNode | null | undefined): TextAlignValue | null {
  if (!node) return null;

  const values: string[] = [];
  if (ALIGNABLE_NODE.has(node.type.name)) {
    values.push(nodeAlign(node));
  } else {
    node.descendants((child) => {
      if (ALIGNABLE_NODE.has(child.type.name)) values.push(nodeAlign(child));
    });
  }

  if (values.length === 0) return null;
  const first = values[0];
  return values.every((value) => value === first) && isAlignValue(first) ? first : null;
}

export function readSelectionTextAlign(editor: Editor): TextAlignValue {
  const heading = editor.getAttributes('heading').textAlign;
  const paragraph = editor.getAttributes('paragraph').textAlign;
  if (isAlignValue(heading)) return heading;
  if (isAlignValue(paragraph)) return paragraph;
  return 'left';
}

export function applySelectionTextAlign(editor: Editor, align: TextAlignValue) {
  editor.chain().focus().setTextAlign(align).run();
}

export function applyBlockTextAlign(
  editor: Editor,
  block: ActiveBlockT | undefined,
  align: TextAlignValue,
) {
  const node = block?.node;
  const pos = block?.pos;
  if (!node || pos == null) {
    applySelectionTextAlign(editor, align);
    return;
  }

  editor.commands.command(({ tr }) => {
    if (ALIGNABLE_NODE.has(node.type.name)) {
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, textAlign: align });
      return true;
    }

    node.descendants((child, offset) => {
      if (!ALIGNABLE_NODE.has(child.type.name)) return;
      tr.setNodeMarkup(pos + offset + 1, undefined, { ...child.attrs, textAlign: align });
    });
    return tr.docChanged;
  });
}

type AlignButtonProps = {
  label: string;
  isActive: boolean;
  className: string;
  onClick: () => void;
  children: ReactNode;
};

function AlignButton({ label, isActive, className, onClick, children }: AlignButtonProps) {
  return (
    <Button
      type="button"
      variant="none"
      aria-label={label}
      aria-pressed={isActive}
      onMouseDown={keepEditorFocus}
      onClick={onClick}
      className={cn(className, isActive && 'bg-status-info-background [&_svg]:fill-icon-brand')}
    >
      {children}
    </Button>
  );
}

type TextAlignButtonsProps = {
  align: TextAlignValue | null;
  variant: 'bubble' | 'toolbar';
  onSelect: (align: TextAlignValue) => void;
};

export function TextAlignButtons({ align, variant, onSelect }: TextAlignButtonsProps) {
  const { t } = useTranslation('editor');
  const labels: Record<TextAlignValue, string> = {
    left: t('bubbleMenu.alignLeft'),
    center: t('bubbleMenu.alignCenter'),
    right: t('bubbleMenu.alignRight'),
    justify: t('bubbleMenu.alignJustify'),
  };
  const buttonClass =
    variant === 'bubble'
      ? '[&_svg]:fill-icon-primary h-6 w-6 rounded-[2px] p-1'
      : 'size-9 shrink-0 rounded-lg p-0 hover:bg-background-page [&_svg]:fill-icon-primary';

  return (
    <>
      {TEXT_ALIGNS.map((value) => {
        const Icon = ALIGN_ICONS[value];
        return (
          <AlignButton
            key={value}
            label={labels[value]}
            isActive={align === value}
            className={buttonClass}
            onClick={() => onSelect(value)}
          >
            {variant === 'bubble' ? <Icon /> : <Icon className="size-6" />}
          </AlignButton>
        );
      })}
    </>
  );
}

type BlockTextAlignProps = {
  editor: Editor;
  block: ActiveBlockT | undefined;
};

export function BlockTextAlign({ editor, block }: BlockTextAlignProps) {
  const [align, setAlign] = useState<TextAlignValue | null>(() => readNodeTextAlign(block?.node));

  useEffect(() => {
    setAlign(readNodeTextAlign(block?.node));
  }, [block]);

  return (
    <TextAlignButtons
      align={align}
      variant="toolbar"
      onSelect={(value) => {
        applyBlockTextAlign(editor, block, value);
        setAlign(value);
      }}
    />
  );
}

type TextAlignMenuProps = {
  editor: Editor;
  variant: 'bubble' | 'toolbar';
};

export function TextAlignMenu({ editor, variant }: TextAlignMenuProps) {
  const { t } = useTranslation('editor');
  const [open, setOpen] = useState(false);
  const [align, setAlign] = useState<TextAlignValue>(() => readSelectionTextAlign(editor));

  useEffect(() => {
    const update = () => {
      try {
        const next = readSelectionTextAlign(editor);
        setAlign((prev) => (prev === next ? prev : next));
      } catch {
        // выделение ещё не готово
      }
    };

    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    update();

    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
    };
  }, [editor]);

  const Icon = ALIGN_ICONS[align];
  const buttonClass =
    variant === 'bubble'
      ? '[&_svg]:fill-icon-primary h-6 w-6 rounded-[2px] p-1'
      : 'size-9 shrink-0 rounded-lg p-0 hover:bg-background-page [&_svg]:fill-icon-primary';

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="none"
          aria-label={t('bubbleMenu.align')}
          aria-pressed={open || align !== 'left'}
          onMouseDown={keepEditorFocus}
          className={cn(
            buttonClass,
            (open || align !== 'left') && 'bg-status-info-background [&_svg]:fill-icon-brand',
          )}
        >
          {variant === 'bubble' ? <Icon /> : <Icon className="size-6" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={variant === 'toolbar' ? 'top' : 'bottom'}
        align="start"
        sideOffset={8}
        className="z-80 flex w-auto min-w-0 flex-row gap-0.5 p-1"
        onCloseAutoFocus={(event) => event.preventDefault()}
        onMouseDown={keepEditorFocus}
        {...({
          onOpenAutoFocus: (event: Event) => event.preventDefault(),
        } as Record<string, unknown>)}
      >
        <TextAlignButtons
          align={align}
          variant={variant}
          onSelect={(value) => {
            applySelectionTextAlign(editor, value);
            setOpen(false);
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
