import type { ExamKind, MathTaskExamMapping } from 'features.math.bank';

export const EXAM_KINDS: ExamKind[] = ['OGE', 'EGE_BASE', 'EGE_PROFILE'];

export const formatExamBadge = (mapping: MathTaskExamMapping, labels: Record<ExamKind, string>) => {
  const exam = labels[mapping.exam];
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
