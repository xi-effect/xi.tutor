import { T, TLBaseShape } from 'tldraw';

/** Минимальный размер по меньшей стороне — меньше этого PDF нечитаем. Используется при создании и ресайзе. */
export const PDF_MIN_SIZE = 520;

/** Максимальный размер по большей стороне (ограничение как у изображений 4096×4096). */
export const PDF_MAX_SIZE = 1024;

/** Сколько страниц показывать в объекте одновременно (1–5). */
export const PDF_PAGES_VISIBLE_MIN = 1;
export const PDF_PAGES_VISIBLE_MAX = 5;

export type PdfShapeProps = {
  src: string;
  fileName: string;
  totalPages: number;
  currentPage: number;
  w: number;
  h: number;
  studentCanFlip: boolean;
  /** Количество страниц, отображаемых в объекте (1 = одна страница, 2 = две подряд и т.д.). */
  pagesVisible: number;
};

export type PdfShape = TLBaseShape<'pdf', PdfShapeProps>;

export const pdfShapeProps = {
  src: T.string,
  fileName: T.string,
  totalPages: T.number,
  currentPage: T.number,
  w: T.number,
  h: T.number,
  studentCanFlip: T.boolean,
  /** Опционально для обратной совместимости со старыми документами и синком. */
  pagesVisible: T.number.optional(),
};
