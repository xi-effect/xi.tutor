import { T, TLBaseShape } from 'tldraw';

export type EmbedShapeProps = {
  url: string;
  title: string;
  /** Санитизированный HTML iframe (если вставлен код embed). Иначе рендерим iframe по url. */
  html: string;
  w: number;
  h: number;
};

export type EmbedShape = TLBaseShape<'embedUrl', EmbedShapeProps>;

export const embedShapeProps = {
  url: T.string,
  title: T.string,
  html: T.string,
  w: T.number,
  h: T.number,
};
