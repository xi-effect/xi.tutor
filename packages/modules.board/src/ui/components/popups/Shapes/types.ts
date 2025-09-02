export type Geo = 'rectangle' | 'ellipse' | 'triangle' | 'diamond' | 'star' | 'rhombus';
export type ShapeOptionT = {
  name: string;
  icon: React.ReactNode;
  geo: Geo;
  dash?: 'draw' | 'solid' | 'dashed' | 'dotted';
};
