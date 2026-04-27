import { T, TLBaseShape } from 'tldraw';

export const FILE_SHAPE_WIDTH = 360;
export const FILE_SHAPE_HEIGHT = 80;
export const FILE_MIN_WIDTH = 300;
export const FILE_MAX_WIDTH = 400;

export type FileShapeProps = {
  src: string;
  fileName: string;
  fileSize: number;
  w: number;
  h: number;
  status: 'loading' | 'uploaded';
};

export const fileShapeProps = {
  src: T.string,
  fileName: T.string,
  fileSize: T.number,
  w: T.number,
  h: T.number,
  status: T.literalEnum('loading', 'uploaded'),
};

export type FileShape = TLBaseShape<'file', FileShapeProps>;
