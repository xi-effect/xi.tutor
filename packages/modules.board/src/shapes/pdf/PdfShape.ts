import { T, TLBaseShape } from 'tldraw';

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
