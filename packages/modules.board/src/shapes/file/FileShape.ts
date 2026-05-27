import { T, DrBaseShape } from '@ibodr/draw';

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
  status: 'loading' | 'uploaded' | 'offline' | 'error';
};

export const fileShapeProps = {
  src: T.string,
  fileName: T.string,
  fileSize: T.number,
  w: T.number,
  h: T.number,
  status: T.literalEnum('loading', 'uploaded', 'offline', 'error'),
};

export type FileShape = DrBaseShape<'file', FileShapeProps>;

declare module '@ibodr/draw' {
  export interface DrGlobalShapePropsMap {
    file: FileShapeProps;
  }
}
