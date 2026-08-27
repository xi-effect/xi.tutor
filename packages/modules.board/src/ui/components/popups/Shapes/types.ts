import type { TGeoShape } from '../../../../types';
import type { MathFigureKind } from '../../../../shapes/math-figure';
import type { BoardTemplateId } from '../../../../shapes/math-figure/insertBoardTemplate';

export type TShapeOption = {
  name: TGeoShape;
  icon: React.ReactNode;
  geo: TGeoShape;
  labelKey: string;
};

export type SolidFigureOption = {
  kind: MathFigureKind;
  icon: React.ReactNode;
  labelKey: string;
};

export type BoardTemplateOption = {
  id: BoardTemplateId;
  icon: React.ReactNode;
  labelKey: string;
};

export type BoardTemplateGroup = {
  subjectKey: 'math' | 'physics' | 'chemistry';
  items: BoardTemplateOption[];
};

export type ShapesPopupTab = 'flat' | 'solid' | 'templates';
