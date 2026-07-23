import { Bold, Brush, Italic, Stroke, Underline } from '@xipkg/icons';
import { MarkFormatesElementsT } from './types';

export const textFormatterElements: MarkFormatesElementsT[] = [
  {
    type: 'bold',
    title: 'Жирный',
    icon: <Bold />,
  },
  {
    type: 'italic',
    title: 'Курсив',
    icon: <Italic />,
  },
  {
    type: 'strike',
    title: 'Зачёркнутый',
    icon: <Stroke />,
  },
  {
    type: 'underline',
    title: 'Подчёркнутый',
    icon: <Underline />,
  },
  {
    type: 'highlight',
    title: 'Выделение',
    icon: <Brush />,
  },
];
