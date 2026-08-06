import { T, DrBaseShape } from '@ibodr/draw';

export type PresentationShapePropsT = {
  src: string;
  fileName: string;
  totalSlides: number;
  currentSlide: number;
  w: number;
  h: number;
  studentCanFlip: boolean;
};

export type PresentationShape = DrBaseShape<'presentation', PresentationShapePropsT>;

declare module '@ibodr/draw' {
  export interface DrGlobalShapePropsMap {
    presentation: PresentationShapePropsT;
  }
}

export const presentationShapeProps = {
  src: T.string,
  fileName: T.string,
  totalSlides: T.number,
  currentSlide: T.number,
  w: T.number,
  h: T.number,
  studentCanFlip: T.boolean,
};
