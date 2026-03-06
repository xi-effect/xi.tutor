import { T, TLBaseShape } from 'tldraw';

export const AUDIO_SHAPE_WIDTH = 320;
export const AUDIO_SHAPE_HEIGHT = 80;
export const AUDIO_MIN_WIDTH = 240;

export type AudioShapeProps = {
  src: string;
  fileName: string;
  fileSize: number;
  duration: number;
  w: number;
  h: number;
  syncPlayback: boolean;
};

export type AudioShape = TLBaseShape<'audio', AudioShapeProps>;

export const audioShapeProps = {
  src: T.string,
  fileName: T.string,
  fileSize: T.number,
  duration: T.number,
  w: T.number,
  h: T.number,
  syncPlayback: T.boolean,
};
