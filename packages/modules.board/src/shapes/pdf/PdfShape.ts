import { T, TLBaseShape } from 'tldraw';

/** Минимальный размер по меньшей стороне — меньше этого PDF нечитаем. Используется при создании и ресайзе. */
export const PDF_MIN_SIZE = 520;

export type PdfShapeProps = {
  src: string;
  fileName: string;
  totalPages: number;
  currentPage: number;
  w: number;
  h: number;
  studentCanFlip: boolean;
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
};
