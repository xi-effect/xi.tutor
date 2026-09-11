import type { ExamKind, MathTaskExamMapping } from 'features.math.bank';
import { EXAM_KINDS_BY_SUBJECT } from '../types';

export const EXAM_KINDS: readonly ExamKind[] = EXAM_KINDS_BY_SUBJECT.mathematics;

export const formatExamBadge = (mapping: MathTaskExamMapping, labels: Record<ExamKind, string>) => {
  const exam = labels[mapping.exam] ?? mapping.exam;
  const number = mapping.taskNumbers[0];
  return { exam, year: mapping.year, number, relation: mapping.relation };
};

export const pickVisibleExamMappings = (mappings: MathTaskExamMapping[]) => {
  const direct = mappings.filter((mapping) => mapping.relation === 'direct');
  if (direct.length) {
    return direct.slice(0, 2);
  }

  return mappings.slice(0, 2);
};
