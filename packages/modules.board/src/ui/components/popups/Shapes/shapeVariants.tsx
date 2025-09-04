import {
  Circle,
  Rectangle,
  RoundedRectangle,
  Trapezoid,
  Triangle,
  Star,
  Diamond,
} from '@xipkg/icons';
import { ShapeOptionT } from './types';

export const shapes: ShapeOptionT[] = [
  { name: 'Rectangle', icon: <Rectangle />, geo: 'rectangle', dash: 'solid' },
  { name: 'Rounded Rectangle', icon: <RoundedRectangle />, geo: 'rectangle', dash: 'draw' },
  { name: 'Oval', icon: <Circle />, geo: 'ellipse' },
  { name: 'Triangle', icon: <Triangle />, geo: 'triangle' },
  { name: 'Diamond', icon: <Diamond />, geo: 'diamond' },
  { name: 'Star', icon: <Star />, geo: 'star' },
  { name: 'Rhombus', icon: <Trapezoid />, geo: 'rhombus' },
];
