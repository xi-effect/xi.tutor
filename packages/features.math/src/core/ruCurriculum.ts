export const RU_MATH_COURSES = {
  mathematics: { grades: [5, 6], label: 'Математика' },
  algebra: { grades: [7, 8, 9], label: 'Алгебра' },
  geometry: { grades: [7, 8, 9, 10, 11], label: 'Геометрия' },
  probability_statistics: { grades: [7, 8, 9], label: 'Вероятность и статистика' },
  algebra_analysis: { grades: [10, 11], label: 'Алгебра и начала математического анализа' },
} as const;

export const RU_EXAMS = {
  oge: { grade: 9, label: 'ОГЭ по математике' },
  ege_basic: { grade: 11, label: 'ЕГЭ по математике — базовый уровень' },
  ege_profile: { grade: 11, label: 'ЕГЭ по математике — профильный уровень' },
} as const;

export type RuMathCourse = keyof typeof RU_MATH_COURSES;
export type RuExam = keyof typeof RU_EXAMS;
