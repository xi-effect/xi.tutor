import { Arrow, ArrowRight, RedLine } from '@xipkg/icons';
import { ArrowTypeT } from './types';

export const arrowVariants: ArrowTypeT[] = [
  { name: 'line', icon: <RedLine />, end: 'none', start: 'none' },
  { name: 'arrow', icon: <Arrow />, end: 'none', start: 'arrow' },
  { name: 'arrowDouble', icon: <ArrowRight />, end: 'arrow', start: 'arrow' },
];
