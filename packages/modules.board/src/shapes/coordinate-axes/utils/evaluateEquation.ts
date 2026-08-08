import i18n from 'i18next';

type Token =
  | { type: 'number'; value: number }
  | { type: 'identifier'; name: string }
  | { type: 'operator'; value: '+' | '-' | '*' | '/' | '^' }
  | { type: 'lparen' }
  | { type: 'rparen' };

const ALLOWED_CHARS = /^[0-9x+\-*/^().,\s_a-zA-Z]+$/;

const FUNCTIONS = new Set(['sin', 'cos', 'tan', 'sqrt', 'abs', 'ln', 'log', 'exp']);

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expression.length) {
    const char = expression[i];

    if (/\s/.test(char)) {
      i += 1;
      continue;
    }

    if (char === '(') {
      tokens.push({ type: 'lparen' });
      i += 1;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: 'rparen' });
      i += 1;
      continue;
    }

    if ('+-*/^'.includes(char)) {
      tokens.push({ type: 'operator', value: char as '+' | '-' | '*' | '/' | '^' });
      i += 1;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      let numStr = char;
      i += 1;
      while (i < expression.length && /[0-9.]/.test(expression[i])) {
        numStr += expression[i];
        i += 1;
      }
      const value = Number(numStr);
      if (Number.isNaN(value)) {
        throw new Error(i18n.t('equation.invalidNumber', { ns: 'board' }));
      }
      tokens.push({ type: 'number', value });
      continue;
    }

    if (/[a-zA-Z_]/.test(char)) {
      let name = char;
      i += 1;
      while (i < expression.length && /[a-zA-Z0-9_]/.test(expression[i])) {
        name += expression[i];
        i += 1;
      }
      tokens.push({ type: 'identifier', name: name.toLowerCase() });
      continue;
    }

    throw new Error(i18n.t('equation.invalidChar', { ns: 'board', char }));
  }

  return tokens;
}

function needsImplicitMultiply(prev: Token | undefined, current: Token): boolean {
  if (!prev) return false;

  // cos(x), sin(x) — вызов функции, не умножение
  if (prev.type === 'identifier' && FUNCTIONS.has(prev.name) && current.type === 'lparen') {
    return false;
  }

  const prevIsValue =
    prev.type === 'number' || prev.type === 'identifier' || prev.type === 'rparen';

  const currentStartsValue =
    current.type === 'number' || current.type === 'identifier' || current.type === 'lparen';

  return prevIsValue && currentStartsValue;
}

function withImplicitMultiplication(tokens: Token[]): Token[] {
  const result: Token[] = [];

  for (const token of tokens) {
    if (needsImplicitMultiply(result[result.length - 1], token)) {
      result.push({ type: 'operator', value: '*' });
    }
    result.push(token);
  }

  return result;
}

class Parser {
  private tokens: Token[];
  private index = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): (x: number) => number {
    const expr = this.parseExpression();
    if (this.peek()) {
      throw new Error(i18n.t('equation.extraChars', { ns: 'board' }));
    }
    return expr;
  }

  private peek(): Token | undefined {
    return this.tokens[this.index];
  }

  private consume(): Token {
    const token = this.tokens[this.index];
    if (!token) {
      throw new Error(i18n.t('equation.unexpectedEnd', { ns: 'board' }));
    }
    this.index += 1;
    return token;
  }

  private parseExpression(): (x: number) => number {
    let left = this.parseTerm();

    while (this.peek()?.type === 'operator') {
      const opToken = this.peek() as { type: 'operator'; value: '+' | '-' | '*' | '/' | '^' };
      if (opToken.value !== '+' && opToken.value !== '-') break;
      const op = (this.consume() as { type: 'operator'; value: '+' | '-' }).value;
      const right = this.parseTerm();
      const prevLeft = left;
      left = (x) => (op === '+' ? prevLeft(x) + right(x) : prevLeft(x) - right(x));
    }

    return left;
  }

  private parseTerm(): (x: number) => number {
    let left = this.parsePower();

    while (this.peek()?.type === 'operator') {
      const opToken = this.peek() as { type: 'operator'; value: '+' | '-' | '*' | '/' | '^' };
      if (opToken.value !== '*' && opToken.value !== '/') break;
      const op = (this.consume() as { type: 'operator'; value: '*' | '/' }).value;
      const right = this.parsePower();
      const prevLeft = left;
      left = (x) => {
        const a = prevLeft(x);
        const b = right(x);
        if (op === '/') {
          if (b === 0) return Number.NaN;
          return a / b;
        }
        return a * b;
      };
    }

    return left;
  }

  private parsePower(): (x: number) => number {
    let base = this.parseUnary();

    if (this.peek()?.type === 'operator') {
      const next = this.peek() as { type: 'operator'; value: '+' | '-' | '*' | '/' | '^' };
      if (next.value === '^') {
        this.consume();
        const exponent = this.parsePower();
        const prevBase = base;
        base = (x) => Math.pow(prevBase(x), exponent(x));
      }
    }

    return base;
  }

  private parseUnary(): (x: number) => number {
    if (this.peek()?.type === 'operator') {
      const op = (this.consume() as { type: 'operator'; value: '+' | '-' }).value;
      const value = this.parseUnary();
      if (op === '-') {
        return (x) => -value(x);
      }
      return value;
    }

    return this.parsePrimary();
  }

  private parsePrimary(): (x: number) => number {
    const token = this.peek();

    if (!token) {
      throw new Error(i18n.t('equation.unexpectedEnd', { ns: 'board' }));
    }

    if (token.type === 'number') {
      this.consume();
      const value = token.value;
      return () => value;
    }

    if (token.type === 'identifier') {
      this.consume();

      if (token.name === 'x') {
        return (x) => x;
      }

      if (token.name === 'pi') {
        return () => Math.PI;
      }

      if (token.name === 'e') {
        return () => Math.E;
      }

      if (FUNCTIONS.has(token.name)) {
        if (this.peek()?.type !== 'lparen') {
          throw new Error(i18n.t('equation.expectedParenAfter', { ns: 'board', name: token.name }));
        }
        this.consume();
        const arg = this.parseExpression();
        if (this.peek()?.type !== 'rparen') {
          throw new Error(i18n.t('equation.expectedClosingParen', { ns: 'board' }));
        }
        this.consume();

        switch (token.name) {
          case 'sin':
            return (x) => Math.sin(arg(x));
          case 'cos':
            return (x) => Math.cos(arg(x));
          case 'tan':
            return (x) => Math.tan(arg(x));
          case 'sqrt':
            return (x) => {
              const v = arg(x);
              return v < 0 ? Number.NaN : Math.sqrt(v);
            };
          case 'abs':
            return (x) => Math.abs(arg(x));
          case 'ln':
            return (x) => {
              const v = arg(x);
              return v <= 0 ? Number.NaN : Math.log(v);
            };
          case 'log':
            return (x) => {
              const v = arg(x);
              return v <= 0 ? Number.NaN : Math.log10(v);
            };
          case 'exp':
            return (x) => Math.exp(arg(x));
          default:
            throw new Error(i18n.t('equation.unknownFunction', { ns: 'board', name: token.name }));
        }
      }

      throw new Error(i18n.t('equation.unknownIdentifier', { ns: 'board', name: token.name }));
    }

    if (token.type === 'lparen') {
      this.consume();
      const expr = this.parseExpression();
      if (this.peek()?.type !== 'rparen') {
        throw new Error(i18n.t('equation.expectedClosingParen', { ns: 'board' }));
      }
      this.consume();
      return expr;
    }

    throw new Error(i18n.t('equation.invalidExpression', { ns: 'board' }));
  }
}

export type EquationEvaluationResult =
  { ok: true; evaluate: (x: number) => number } | { ok: false; error: string };

export function evaluateEquation(expression: string): EquationEvaluationResult {
  const trimmed = expression.trim();
  if (!trimmed) {
    return { ok: false, error: i18n.t('equation.emptyExpression', { ns: 'board' }) };
  }

  if (!ALLOWED_CHARS.test(trimmed)) {
    return { ok: false, error: i18n.t('equation.invalidChars', { ns: 'board' }) };
  }

  try {
    const tokens = withImplicitMultiplication(tokenize(trimmed));
    const evaluate = new Parser(tokens).parse();
    const test = evaluate(0);
    if (typeof test !== 'number') {
      return { ok: false, error: i18n.t('equation.evalFailed', { ns: 'board' }) };
    }
    return { ok: true, evaluate };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : i18n.t('equation.expressionError', { ns: 'board' }),
    };
  }
}
