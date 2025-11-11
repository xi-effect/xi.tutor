type ArrowShapeHeadTypeT = 'none' | 'arrow';

export type ArrowTypeT = {
  name: string;
  start: ArrowShapeHeadTypeT;
  end: ArrowShapeHeadTypeT;
  icon: React.ReactNode;
};
