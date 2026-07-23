import { ReactNode } from 'react';
import { DrRichText, Editor } from '@ibodr/draw';

export type MarkFormatT =
  'bold' | 'italic' | 'strike' | 'underline' | 'highlight' | 'link' | 'bulletList';

export type ActiveFormatesMapT = Record<MarkFormatT, boolean>;

export type MarkT = {
  type: MarkFormatT;
  attrs?: Record<string, string | null>;
};

export type RichNodeT = {
  type: string;
  attrs?: Record<string, string>;
  content?: RichNodeT[];
  marks?: MarkT[];
};

export type DrRichTextWithNodesT = Omit<DrRichText, 'content'> & {
  content: RichNodeT[];
};

export type MarkFormatesElementsT = {
  type: MarkFormatT;
  title: string;
  icon: ReactNode;
};

// Временное решение. Правильный тип для extensions @tiptap нужно задекларировать в @ibodr
export type ChainedCommandsFallbackT = {
  setLink?: ({ href }: { href: string }) => { run: () => void };
  unsetLink?: () => { run: () => void };
  toggleBulletList?: () => { run: () => void };
  toggleBold?: () => { run: () => void };
  toggleItalic?: () => { run: () => void };
  toggleStrike?: () => { run: () => void };
  toggleUnderline?: () => { run: () => void };
  toggleHighlight?: () => { run: () => void };
};

export type ShapeWithRichTextT = {
  props: { richText: DrRichTextWithNodesT };
} & ReturnType<Editor['getSelectedShapes']>[number];

export type ShapeTypesWithRichTextT = 'xi-geo' | 'note' | 'arrow' | 'text';
