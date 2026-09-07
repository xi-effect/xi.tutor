export type MathCommand = {
  id: string;
  label: string;
  latex: string;
  aliases: string[];
};

export const MATH_COMMANDS: MathCommand[] = [
  { id: 'fraction', label: 'a/b', latex: '\\frac{#0}{#?}', aliases: ['дробь', 'fraction'] },
  { id: 'power', label: 'x²', latex: '^{#?}', aliases: ['степень', 'power'] },
  { id: 'subscript', label: 'xₙ', latex: '_{#?}', aliases: ['индекс', 'subscript'] },
  { id: 'sqrt', label: '√', latex: '\\sqrt{#0}', aliases: ['корень', 'sqrt'] },
  { id: 'nth-root', label: 'ⁿ√', latex: '\\sqrt[#?]{#0}', aliases: ['корень n степени'] },
  { id: 'brackets', label: '( )', latex: '\\left(#0\\right)', aliases: ['скобки'] },
  { id: 'absolute', label: '|x|', latex: '\\left|#0\\right|', aliases: ['модуль'] },
  { id: 'equal', label: '=', latex: '=', aliases: ['равно'] },
  { id: 'not-equal', label: '≠', latex: '\\ne', aliases: ['не равно'] },
  { id: 'less', label: '<', latex: '<', aliases: ['меньше'] },
  { id: 'greater', label: '>', latex: '>', aliases: ['больше'] },
  { id: 'less-equal', label: '≤', latex: '\\le', aliases: ['меньше или равно'] },
  { id: 'greater-equal', label: '≥', latex: '\\ge', aliases: ['больше или равно'] },
  { id: 'approx', label: '≈', latex: '\\approx', aliases: ['приблизительно'] },
  { id: 'plus-minus', label: '±', latex: '\\pm', aliases: ['плюс минус'] },
  { id: 'times', label: '×', latex: '\\times', aliases: ['умножить'] },
  { id: 'divide', label: '÷', latex: '\\div', aliases: ['делить'] },
  { id: 'dot', label: '·', latex: '\\cdot', aliases: ['точка'] },
  { id: 'infinity', label: '∞', latex: '\\infty', aliases: ['бесконечность'] },
  { id: 'alpha', label: 'α', latex: '\\alpha', aliases: ['альфа'] },
  { id: 'beta', label: 'β', latex: '\\beta', aliases: ['бета'] },
  { id: 'gamma', label: 'γ', latex: '\\gamma', aliases: ['гамма'] },
  { id: 'delta', label: 'δ', latex: '\\delta', aliases: ['дельта'] },
  { id: 'theta', label: 'θ', latex: '\\theta', aliases: ['тета'] },
  { id: 'lambda', label: 'λ', latex: '\\lambda', aliases: ['лямбда'] },
  { id: 'mu', label: 'μ', latex: '\\mu', aliases: ['мю'] },
  { id: 'pi', label: 'π', latex: '\\pi', aliases: ['пи'] },
  { id: 'sigma', label: 'σ', latex: '\\sigma', aliases: ['сигма'] },
  { id: 'phi', label: 'φ', latex: '\\phi', aliases: ['фи'] },
  { id: 'omega', label: 'ω', latex: '\\omega', aliases: ['омега'] },
  { id: 'degree', label: '°', latex: '^{\\circ}', aliases: ['градус'] },
  { id: 'angle', label: '∠', latex: '\\angle', aliases: ['угол'] },
  { id: 'perpendicular', label: '⊥', latex: '\\perp', aliases: ['перпендикуляр'] },
  { id: 'parallel', label: '∥', latex: '\\parallel', aliases: ['параллельно'] },
  { id: 'triangle', label: '△', latex: '\\triangle', aliases: ['треугольник'] },
  { id: 'limit', label: 'lim', latex: '\\lim_{#?}', aliases: ['предел'] },
  { id: 'sum', label: '∑', latex: '\\sum_{#?}^{#?}', aliases: ['сумма'] },
  { id: 'product', label: '∏', latex: '\\prod_{#?}^{#?}', aliases: ['произведение'] },
  { id: 'integral', label: '∫', latex: '\\int_{#?}^{#?}', aliases: ['интеграл'] },
];

export const MATH_TOOLBAR_GROUPS = {
  structure: [
    'fraction',
    'power',
    'subscript',
    'sqrt',
    'nth-root',
    'absolute',
    'brackets',
    'equal',
  ],
  symbols: ['pi', 'alpha', 'degree', 'less-equal', 'not-equal', 'plus-minus', 'times', 'infinity'],
  calculus: ['sum', 'integral', 'limit', 'product'],
} as const;

export const PRIMARY_MATH_COMMANDS = [
  ...MATH_TOOLBAR_GROUPS.structure,
  ...MATH_TOOLBAR_GROUPS.symbols,
  ...MATH_TOOLBAR_GROUPS.calculus,
];

export const MATRIX_TEMPLATES = {
  '2×2': '\\begin{pmatrix}#?&#?\\\\#?&#?\\end{pmatrix}',
  '2×3': '\\begin{pmatrix}#?&#?&#?\\\\#?&#?&#?\\end{pmatrix}',
  '3×2': '\\begin{pmatrix}#?&#?\\\\#?&#?\\\\#?&#?\\end{pmatrix}',
  '3×3': '\\begin{pmatrix}#?&#?&#?\\\\#?&#?&#?\\\\#?&#?&#?\\end{pmatrix}',
};

export const CASES_TEMPLATE = '\\begin{cases}#?\\\\#?\\end{cases}';

export function searchMathCommands(query: string): MathCommand[] {
  const normalized = query.trim().toLocaleLowerCase('ru');
  if (!normalized) return MATH_COMMANDS;
  return MATH_COMMANDS.filter((command) =>
    [command.label, command.latex, ...command.aliases].some((value) =>
      value.toLocaleLowerCase('ru').includes(normalized),
    ),
  );
}
