const MATH_RHS = /^(?:sqrt|sin|cos|tan|abs|ln|log|exp|[0-9a-zA-Z+\-*/^().,\s_])+/i;

export function normalizeMathText(text: string): string {
  return text
    .replace(/[\u2061-\u2064]/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[–—−]/g, '-')
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/\^\{([^{}]*)\}/g, '^($1)')
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^{}]*)\}/g, 'sqrt($1)')
    .replace(/π/g, 'pi')
    .replace(/√\s*\(([^)]+)\)/g, 'sqrt($1)')
    .replace(/х/g, 'x')
    .replace(/у\s*=/gi, 'y =')
    .replace(/\s+/g, ' ')
    .trim();
}

export function takeMathRhs(expression: string): string {
  const trimmed = expression.replace(/[\s.!;:,]+$/g, '').trim();
  const match = trimmed.match(MATH_RHS);
  return match ? match[0].trim() : '';
}

export function normalizeExpression(expression: string): string {
  return normalizeMathText(expression)
    .replace(/(\d)([a-zA-Z])/g, '$1*$2')
    .replace(/([a-zA-Z])(\d)/g, '$1*$2');
}
