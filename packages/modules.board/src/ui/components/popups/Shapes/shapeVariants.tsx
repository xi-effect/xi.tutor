import { Circle, Rectangle, Trapezoid, Triangle, Star, Diamond } from '@xipkg/icons';
import { TShapeOption } from './types';

export const shapes: TShapeOption[] = [
  { name: 'rectangle', icon: <Rectangle />, geo: 'rectangle' },
  { name: 'ellipse', icon: <Circle />, geo: 'ellipse' },
  { name: 'triangle', icon: <Triangle />, geo: 'triangle' },
  { name: 'diamond', icon: <Diamond />, geo: 'diamond' },
  { name: 'star', icon: <Star />, geo: 'star' },
  { name: 'rhombus', icon: <Trapezoid />, geo: 'rhombus' },
];
