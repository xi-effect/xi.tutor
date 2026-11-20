import { T, type DrBaseShape } from '@ibodr/draw';

export const DICE_SHAPE_SIZE = 128;
export const DICE_MIN_SIZE = 72;

export type DiceShapeProps = {
  w: number;
  h: number;
  sides: number;
  value: number;
  rolledAt: number;
};

export type DiceShape = DrBaseShape<'dice', DiceShapeProps>;

declare module '@ibodr/draw' {
  export interface DrGlobalShapePropsMap {
    dice: DiceShapeProps;
  }
}

export const diceShapeProps = {
  w: T.number,
  h: T.number,
  sides: T.number,
  value: T.number,
  rolledAt: T.number,
};
