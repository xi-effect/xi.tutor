import {
  ActivityMultipleChoice,
  ChevronBottom,
  Fraction,
  LongAnswer,
  OptionSelectionTest,
  SimpleAnswertTest,
  Upload,
  type IconProps,
} from '@xipkg/icons';
import type { ComponentType } from 'react';
import type { HomeworkQuestionType } from '../types';

export const QUESTION_TYPE_ICONS: Record<HomeworkQuestionType, ComponentType<IconProps>> = {
  short_text: SimpleAnswertTest,
  long_text: LongAnswer,
  single_choice: OptionSelectionTest,
  multiple_choice: ActivityMultipleChoice,
  dropdown: ChevronBottom,
  number: Fraction,
  file: Upload,
};
