import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';
import { SeededRandom } from '../src/generation/rng.ts';
import {
  historicalArchetypes,
  type HistoricalArchetype,
} from '../src/generation/historical/catalog.ts';

type ExamMapping = {
  exam: 'OGE' | 'EGE_BASE' | 'EGE_PROFILE';
  year: number;
  taskNumbers: number[];
  relation: 'direct' | 'foundation' | 'adjacent';
  note?: string;
};

type Answer = { type: 'number' | 'fraction' | 'expression'; value: string; display: string };
type Figure = { kind: string; [key: string]: unknown } | null;
type GeneratedCore = {
  statement: string;
  answer: Answer;
  steps: string[];
  hints: string[];
  taskType:
    | 'calculation'
    | 'short_answer'
    | 'word_problem'
    | 'equation'
    | 'inequality'
    | 'expression'
    | 'function'
    | 'geometry'
    | 'probability'
    | 'applied'
    | 'parameter';
  figure?: Figure;
  parameters: Record<string, unknown>;
};
type MathTaskLike = Record<string, unknown>;

const ROOT = resolve(import.meta.dirname, '..');
const SOURCE = resolve(ROOT, 'content/tasks.source.json.gz');
const PROVENANCE = resolve(ROOT, 'content/historical_provenance.json.gz');
const CONTENT_VERSION = 'historical-archetypes-v1-2026-09-10';
const ORIGIN = 'historical-archetype-generation-v1';
const SEED = 20260910;

const TARGET_BY_GRADE: Record<number, number> = {
  5: 1200,
  6: 1500,
  7: 1800,
  8: 1900,
  9: 2100,
  10: 1600,
  11: 1900,
};

const sources = {
  'kiselev-arithmetic': {
    author: 'А. П. Киселёв',
    authorLife: '1852–1940',
    work: 'Систематический курс арифметики / классическая арифметическая традиция Киселёва',
    sourceUrl: 'https://www.mathedu.ru/indexes/authors/kiselev_a_p/',
    use: 'Только математические архетипы и последовательность идей; формулировки и числа новые.',
  },
  'kiselev-geometry': {
    author: 'А. П. Киселёв',
    authorLife: '1852–1940',
    work: 'Элементарная геометрия',
    sourceUrl: 'https://www.mathedu.ru/text/kiselev_elementarnaya_geometriya_1914/',
    use: 'Только геометрические архетипы; текст задач не переносится.',
  },
  'rybkin-planimetry': {
    author: 'Н. А. Рыбкин',
    authorLife: '1861–1919',
    work: 'Сборник задач по геометрии. Планиметрия',
    sourceUrl: 'https://www.mathedu.ru/text/rybkin_sbornik_zadach_po_geometrii_ch1_1956/',
    use: 'Используется тип геометрической конструкции; поздняя редакционная оболочка не копируется.',
  },
  'rybkin-stereometry': {
    author: 'Н. А. Рыбкин',
    authorLife: '1861–1919',
    work: 'Сборник задач по геометрии. Стереометрия',
    sourceUrl: 'https://www.mathedu.ru/indexes/authors/rybkin_n_a/',
    use: 'Используются классические метрические архетипы; формулировки полностью новые.',
  },
  'shaposhnikov-valtsov-algebra': {
    author: 'Н. А. Шапошников, Н. К. Вальцов',
    authorLife: '1851–1920; 1858–1900',
    work: 'Сборник алгебраических задач',
    sourceUrl:
      'https://www.mathedu.ru/text/shaposhnikov_valzcov_sbornik_algebraicheskih_zadach_ch1_1935/',
    use: 'Берутся только алгебраические архетипы исходных авторов; объяснительный текст поздних редакторов не используется.',
  },
  'shaposhnikov-trigonometry': {
    author: 'Н. А. Шапошников',
    authorLife: '1851–1920',
    work: 'Курс прямолинейной тригонометрии и собрание тригонометрических задач',
    sourceUrl: 'https://www.mathedu.ru/indexes/authors/shaposhnikov_n_a/',
    use: 'Используются только типы тригонометрических упражнений; все данные и текст новые.',
  },
} as const;

const readGzip = <T>(path: string): T =>
  JSON.parse(gunzipSync(readFileSync(path)).toString('utf8')) as T;
const writeGzip = (path: string, value: unknown) =>
  writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(value)), { level: 9 }));
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);
const choose = (n: number, k: number) => {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i += 1) r = (r * (n - k + i)) / i;
  return Math.round(r);
};
const reduce = (n: number, d: number) => {
  if (d === 0) throw new Error('zero denominator');
  const sign = d < 0 ? -1 : 1;
  const g = gcd(n, d);
  return [(sign * n) / g, (sign * d) / g] as const;
};
const fracAnswer = (n: number, d: number): Answer => {
  const [nn, dd] = reduce(n, d);
  if (dd === 1) return { type: 'number', value: String(nn), display: String(nn) };
  return { type: 'fraction', value: `${nn}/${dd}`, display: `\\frac{${nn}}{${dd}}` };
};
const numberAnswer = (n: number): Answer => ({
  type: 'number',
  value: String(n),
  display: String(n),
});
const exprAnswer = (value: string, display = value): Answer => ({
  type: 'expression',
  value,
  display,
});
const fmtSigned = (n: number) => (n < 0 ? `${n}` : `+${n}`);
const tidyMathText = (value: string) =>
  value
    .replace(/\+\-/g, '-')
    .replace(/--/g, '+')
    .replace(/\+0(?!\.\d|\d)/g, '')
    .replace(/-0(?!\.\d|\d)/g, '')
    .replace(/-1x/g, '-x')
    .replace(/(^|[^0-9])1x/g, '$1x')
    .replace(/-1s·x/g, '-s·x')
    .replace(/(^|[^0-9])1s·x/g, '$1s·x')
    .replace(/-1\(m/g, '-(m')
    .replace(/(^|[^0-9])1\(m/g, '$1(m');

const tidyGeneratedCore = (core: GeneratedCore): GeneratedCore => ({
  ...core,
  statement: tidyMathText(core.statement),
  steps: core.steps.map(tidyMathText),
  hints: core.hints.map(tidyMathText),
  answer: {
    ...core.answer,
    display: tidyMathText(core.answer.display),
    value: tidyMathText(core.answer.value),
  },
});

const normalizeFingerprint = (value: string) =>
  value
    .toLocaleLowerCase('ru-RU')
    .replaceAll('ё', 'е')
    .replaceAll('−', '-')
    .replaceAll('·', '*')
    .replaceAll('\\cdot', '*')
    .replace(/\\(frac|sqrt|pi|sin|cos|tan|log|begin|end|overrightarrow)/g, ' $1 ')
    .replace(/[{}$^_\\,.;:!?()\[\]]/g, ' ')
    .replace(/[^0-9a-zа-я+\-*/=<>]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const fingerprint = (statement: string) =>
  createHash('sha1').update(normalizeFingerprint(statement)).digest('hex').slice(0, 16);
const normalizeSearch = (value: string) =>
  value
    .toLocaleLowerCase('ru-RU')
    .replaceAll('ё', 'е')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[{}$^_\\]/g, ' ')
    .replace(/[^0-9a-zа-я]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const triples = [
  [3, 4, 5],
  [5, 12, 13],
  [7, 24, 25],
  [8, 15, 17],
  [9, 40, 41],
  [12, 35, 37],
  [20, 21, 29],
] as const;
const quadruples = [
  [1, 2, 2, 3],
  [2, 3, 6, 7],
  [4, 4, 7, 9],
  [1, 4, 8, 9],
] as const;

function examMappingsFor(a: HistoricalArchetype): ExamMapping[] {
  const relation: ExamMapping['relation'] = a.difficulty === 5 ? 'adjacent' : 'foundation';
  const id = a.topicId;
  if (a.grade <= 9) {
    let numbers = [6];
    if (/equation|system|quadratic|rational/.test(id)) numbers = a.grade >= 9 ? [9, 20] : [9];
    else if (/probability/.test(id)) numbers = [10];
    else if (/function/.test(id)) numbers = [11];
    else if (/sequence/.test(id)) numbers = [14];
    else if (/triangle|trigonometry|right_triangle|bisector|similarity/.test(id))
      numbers = a.grade >= 9 ? [15, 23, 24] : [15];
    else if (/circle|chord/.test(id)) numbers = a.grade >= 9 ? [16, 24, 25] : [16];
    else if (/trapezoid|rectangle|coordinate/.test(id))
      numbers = a.grade >= 9 ? [17, 18, 24] : [17, 18];
    else if (/percent|ratio|motion|work|mixture/.test(id))
      numbers = a.grade >= 9 ? [1, 2, 3, 4, 5, 21] : [1, 2, 3, 4, 5, 6];
    else if (/number_theory|numbers\./.test(id)) numbers = a.grade >= 9 ? [6, 20] : [6];
    return [
      {
        exam: 'OGE',
        year: 2026,
        taskNumbers: numbers,
        relation,
        note: 'Авторское задание по соответствующему навыку; не копия КИМ.',
      },
    ];
  }

  let profile = [7];
  if (/vector/.test(id)) profile = [2];
  else if (/stereometry|prism|pyramid/.test(id)) profile = a.difficulty >= 4 ? [3, 14] : [3];
  else if (/probability/.test(id)) profile = [4, 5];
  else if (/trigonometry|exponential|logarithm|equation/.test(id))
    profile = a.difficulty >= 4 ? [6, 13, 15] : [6, 7];
  else if (/calculus|derivative|tangent/.test(id)) profile = [8, 12];
  else if (/finance/.test(id)) profile = [16];
  else if (/parameter/.test(id)) profile = [18];
  else if (/number_theory/.test(id)) profile = [19];
  else if (/geometry|circle/.test(id)) profile = [1, 17];
  return [
    {
      exam: 'EGE_PROFILE',
      year: 2026,
      taskNumbers: profile,
      relation,
      note: 'Связь с линиями ЕГЭ указана по проверяемому навыку; формулировка авторская.',
    },
  ];
}

function createTask(
  archetype: HistoricalArchetype,
  core: GeneratedCore,
  id: string,
  seed: number,
): MathTaskLike {
  const mappings = examMappingsFor(archetype);
  const terms = [
    'Математика',
    `${archetype.grade} класс`,
    archetype.topic,
    archetype.subtopic,
    ...archetype.skills,
    ...archetype.tags,
    ...archetype.aliases,
    ...mappings.flatMap((m) =>
      m.taskNumbers.flatMap((n) => [
        `${m.exam} ${m.year} задание ${n}`,
        `${m.exam}:${m.year}:${n}`,
      ]),
    ),
    `сложность ${archetype.difficulty}`,
    `уровень ${archetype.difficulty}`,
  ];
  return {
    id,
    contentVersion: CONTENT_VERSION,
    subject: 'mathematics',
    subjectLabel: 'Математика',
    grade: archetype.grade,
    curriculum: {
      country: 'RU',
      framework: 'Федеральная рабочая программа',
      level: 'base',
      referenceYear: 2026,
    },
    topicId: archetype.topicId,
    topic: archetype.topic,
    subtopic: archetype.subtopic,
    skills: archetype.skills,
    difficulty: archetype.difficulty,
    taskType: core.taskType,
    statement: { text: core.statement },
    answer: core.answer,
    solution: { short: core.steps.at(-1)!, steps: core.steps },
    hints: core.hints,
    tags: [...archetype.tags, 'historical-archetype'],
    examMappings: mappings,
    figure: core.figure ?? null,
    generator: {
      id: archetype.id,
      variantGroupId: archetype.groupId,
      parameters: {
        archetypeId: archetype.id,
        historicalSource: archetype.sourceKey,
        ...core.parameters,
      },
      seed,
    },
    source: {
      kind: 'synthetic',
      origin: ORIGIN,
      copiedFromExternalBank: false,
      note: 'Новая авторская формулировка sovlium по классическому математическому архетипу. Текст, числа и решение сгенерированы заново; исторический источник используется только как источник типа задачи.',
    },
    search: {
      aliases: archetype.aliases,
      terms,
      normalizedText: normalizeSearch(`${core.statement} ${terms.join(' ')}`),
    },
    fingerprint: fingerprint(core.statement),
  };
}

function generateCore(
  a: HistoricalArchetype,
  rng: SeededRandom,
  sequence: number,
): GeneratedCore | null {
  const v = a.variant;
  switch (a.kind) {
    case 'ratio_sum': {
      let r1 = rng.int(2, 5 + v),
        r2 = rng.int(2, 6 + v),
        r3 = rng.int(2, 7 + v);
      if (r1 === r2) r2 += 1;
      if (r2 === r3) r3 += 1;
      let k = rng.int(4, 30);
      if (a.difficulty === 5 && k % 2) k += 1;
      const total = (r1 + r2 + r3) * k;
      const values = [r1 * k, r2 * k, r3 * k];
      if (a.difficulty === 3) {
        const idx = rng.int(0, 2);
        return {
          statement: `Три величины относятся как ${r1}:${r2}:${r3}, а их сумма равна ${total}. Найдите ${idx + 1}-ю величину.`,
          answer: numberAnswer(values[idx]!),
          steps: [
            `Всего частей: ${r1}+${r2}+${r3}=${r1 + r2 + r3}.`,
            `Одна часть равна ${total}:${r1 + r2 + r3}=${k}.`,
            `Искомая величина: ${[r1, r2, r3][idx]}·${k}=${values[idx]}.`,
          ],
          hints: ['Найдите стоимость одной части отношения.'],
          taskType: 'word_problem',
          parameters: { r1, r2, r3, k, total, idx },
        };
      }
      if (a.difficulty === 4) {
        const max = Math.max(...values),
          min = Math.min(...values);
        return {
          statement: `Три отрезка имеют длины в отношении ${r1}:${r2}:${r3}. Их суммарная длина ${total} см. На сколько сантиметров самый длинный отрезок длиннее самого короткого?`,
          answer: numberAnswer(max - min),
          steps: [
            `Одна доля отношения равна ${k} см.`,
            `Длины: ${values.join(', ')} см.`,
            `Разность наибольшей и наименьшей длин: ${max}-${min}=${max - min} см.`,
          ],
          hints: ['Сначала восстановите все три длины.'],
          taskType: 'word_problem',
          parameters: { r1, r2, r3, k, total },
        };
      }
      const maxRatio = Math.max(r1, r2, r3),
        minRatio = Math.min(r1, r2, r3);
      const transfer = ((maxRatio - minRatio) * k) / 2;
      return {
        statement: `Количество деталей трёх видов относится как ${r1}:${r2}:${r3}; всего их ${total}. Сколько деталей нужно переложить из самой большой группы в самую маленькую, чтобы эти две группы стали равны?`,
        answer: numberAnswer(transfer),
        steps: [
          `Одна часть равна ${k}.`,
          `Самая большая и самая маленькая группы отличаются на ${(maxRatio - minRatio) * k}.`,
          `При переносе одной детали разность уменьшается на 2, поэтому нужно перенести ${(maxRatio - minRatio) * k}:2=${transfer}.`,
        ],
        hints: ['При переносе из одной группы в другую меняются сразу обе группы.'],
        taskType: 'word_problem',
        parameters: { r1, r2, r3, k, total, transfer },
      };
    }
    case 'reverse_fraction': {
      const b1 = rng.int(4, 9),
        a1 = rng.int(1, b1 - 2),
        b2 = rng.int(3, 8),
        a2 = rng.int(1, b2 - 1);
      if (a.difficulty < 5) {
        const N = b1 * b2 * rng.int(3, 25);
        const rem1 = (N * (b1 - a1)) / b1;
        const rem2 = (rem1 * (b2 - a2)) / b2;
        const extra = a.difficulty === 4 ? rng.int(2, 20) : 0;
        const shown = rem2 - extra;
        if (shown <= 0) return null;
        return {
          statement: `От некоторого количества сначала использовали $\\frac{${a1}}{${b1}}$, затем $\\frac{${a2}}{${b2}}$ оставшегося${extra ? `, а после этого ещё ${extra}` : ''}. В итоге осталось ${shown}. Сколько было первоначально?`,
          answer: numberAnswer(N),
          steps: [
            extra
              ? `До последнего действия оставалось ${shown}+${extra}=${rem2}.`
              : `После двух действий осталось ${rem2}.`,
            `Перед вторым использованием было ${rem2}·${b2}/${b2 - a2}=${rem1}.`,
            `Первоначально было ${rem1}·${b1}/${b1 - a1}=${N}.`,
          ],
          hints: ['Восстанавливайте количество с конца.'],
          taskType: 'word_problem',
          parameters: { a1, b1, a2, b2, N, extra },
        };
      }
      const b3 = rng.int(3, 7),
        a3 = rng.int(1, b3 - 1);
      const N = b1 * b2 * b3 * rng.int(2, 15);
      const r1 = (N * (b1 - a1)) / b1,
        r2 = (r1 * (b2 - a2)) / b2,
        r3 = (r2 * (b3 - a3)) / b3;
      return {
        statement: `В запасе было некоторое количество материала. Сначала израсходовали $\\frac{${a1}}{${b1}}$ запаса, затем $\\frac{${a2}}{${b2}}$ остатка, затем $\\frac{${a3}}{${b3}}$ нового остатка. После этого осталось ${r3}. Найдите исходный запас.`,
        answer: numberAnswer(N),
        steps: [
          `До третьего этапа было ${r3}·${b3}/${b3 - a3}=${r2}.`,
          `До второго этапа: ${r2}·${b2}/${b2 - a2}=${r1}.`,
          `До первого этапа: ${r1}·${b1}/${b1 - a1}=${N}.`,
        ],
        hints: ['Идите от последнего остатка к исходному количеству.'],
        taskType: 'word_problem',
        parameters: { a1, b1, a2, b2, a3, b3, N },
      };
    }
    case 'digit_number': {
      if (a.difficulty < 5) {
        let x = rng.int(2, 9),
          y = rng.int(0, 8);
        if (x === y) y = (y + 2) % 9;
        if (x < y) [x, y] = [y, x];
        const num = 10 * x + y,
          rev = 10 * y + x,
          sum = x + y,
          diff = num - rev,
          add = rng.int(0, 24);
        const tail = add ? ` В ответе запишите найденное число, увеличенное на ${add}.` : '';
        const final = num + add;
        return {
          statement: `Двузначное число больше числа, записанного теми же цифрами в обратном порядке, на ${diff}. Сумма его цифр равна ${sum}. Найдите исходное число.${tail}`,
          answer: numberAnswer(final),
          steps: [
            `Пусть десятки — x, единицы — y. Тогда x+y=${sum}.`,
            `Разность чисел равна 9(x-y)=${diff}, поэтому x-y=${diff / 9}.`,
            `Получаем x=${x}, y=${y}; число равно ${num}.${add ? ` После дополнительного действия: ${num}+${add}=${final}.` : ''}`,
          ],
          hints: ['Представьте число как 10x+y.'],
          taskType: 'word_problem',
          parameters: { x, y, num, rev, add },
        };
      }
      let h = rng.int(2, 9),
        o = rng.int(0, 8);
      if (h === o) o = (o + 3) % 9;
      if (h < o) [h, o] = [o, h];
      const t = rng.int(0, 9);
      const num = 100 * h + 10 * t + o,
        rev = 100 * o + 10 * t + h;
      const sum = h + t + o,
        diff = num - rev;
      return {
        statement: `Трёхзначное число при перестановке первой и последней цифр уменьшается на ${diff}. Его средняя цифра равна ${t}, а сумма всех цифр равна ${sum}. Найдите исходное число.`,
        answer: numberAnswer(num),
        steps: [
          `Пусть крайние цифры h и o. Тогда h+o=${sum - t}.`,
          `Разность исходного и обращённого числа равна 99(h-o)=${diff}, значит h-o=${diff / 99}.`,
          `Отсюда h=${h}, o=${o}; число ${num}.`,
        ],
        hints: ['Разность abc и cba равна 99(a-c).'],
        taskType: 'word_problem',
        parameters: { h, t, o, num, rev },
      };
    }
    case 'remainders': {
      const mods =
        a.difficulty === 5
          ? [3, 5, 7]
          : rng.pick([
              [3, 4],
              [4, 5],
              [5, 7],
              [7, 8],
            ] as const);
      const L = mods.reduce((acc, m) => lcm(acc, m), 1);
      const residue = rng.int(0, L - 1);
      const k = rng.int(3, 14);
      const ans = residue + k * L;
      const lower = ans - rng.int(1, L - 1);
      const rems = mods.map((m) => ans % m);
      const clauses = mods
        .map((m, i) => `при делении на ${m} даёт остаток ${rems[i]}`)
        .join(', а ');
      return {
        statement: `Найдите наименьшее натуральное число, большее ${lower}, которое ${clauses}.`,
        answer: numberAnswer(ans),
        steps: [
          `Все решения повторяются с периодом НОК(${mods.join(', ')})=${L}.`,
          `Число ${ans} удовлетворяет всем условиям.`,
          `Предыдущее такое число равно ${ans - L}, а оно не больше ${lower}; поэтому ответ ${ans}.`,
        ],
        hints: ['Сначала найдите общий период условий.'],
        taskType: 'short_answer',
        parameters: { mods, rems, L, lower, ans },
      };
    }
    case 'rectangle_inverse': {
      if (a.difficulty === 5) {
        const [aa, bb, cc] = rng.pick(triples);
        const scale = rng.int(1, 20);
        const x = aa * scale,
          y = bb * scale,
          d = cc * scale,
          delta = Math.abs(y - x),
          area = x * y;
        return {
          statement: `Диагональ прямоугольника равна ${d} см, а одна сторона на ${delta} см длиннее другой. Найдите площадь прямоугольника.`,
          answer: numberAnswer(area),
          steps: [
            `Пусть меньшая сторона x, тогда большая x+${delta}.`,
            `По теореме Пифагора: x²+(x+${delta})²=${d * d}.`,
            `Положительный корень даёт стороны ${Math.min(x, y)} и ${Math.max(x, y)} см, поэтому площадь равна ${area} см².`,
          ],
          hints: ['Свяжите стороны и диагональ теоремой Пифагора.'],
          taskType: 'geometry',
          figure: {
            kind: 'rectangle',
            width: Math.min(x, y),
            height: Math.max(x, y),
            labels: { diagonal: `${d} см`, difference: `${delta} см` },
          },
          parameters: { x, y, d, delta },
        };
      }
      const x = rng.int(4, 30),
        delta = rng.int(2, 15),
        y = x + delta,
        area = x * y,
        P = 2 * (x + y);
      if (a.difficulty === 3)
        return {
          statement: `Периметр прямоугольника равен ${P} см, а одна сторона на ${delta} см длиннее другой. Найдите площадь.`,
          answer: numberAnswer(area),
          steps: [
            `Полупериметр равен ${P / 2}, поэтому x+(x+${delta})=${P / 2}.`,
            `Отсюда x=${x}, вторая сторона ${y}.`,
            `Площадь ${x}·${y}=${area} см².`,
          ],
          hints: ['Используйте полупериметр.'],
          taskType: 'geometry',
          figure: { kind: 'rectangle', width: x, height: y, labels: true },
          parameters: { x, y, delta, P },
        };
      return {
        statement: `Площадь прямоугольника равна ${area} см², а одна сторона на ${delta} см длиннее другой. Найдите его периметр.`,
        answer: numberAnswer(P),
        steps: [
          `Пусть стороны x и x+${delta}. Тогда x(x+${delta})=${area}.`,
          `Положительное решение даёт x=${x}, другая сторона ${y}.`,
          `Периметр 2(${x}+${y})=${P} см.`,
        ],
        hints: ['Составьте уравнение по площади.'],
        taskType: 'geometry',
        figure: { kind: 'rectangle', width: x, height: y, labels: true },
        parameters: { x, y, delta, area },
      };
    }
    case 'motion_multi': {
      if (a.difficulty === 3) {
        const v1 = rng.int(30, 80),
          v2 = rng.int(35, 90),
          t1 = rng.int(1, 4),
          t2 = rng.int(1, 4);
        const dist = v1 * t1 + v2 * t2;
        const totalT = t1 + t2;
        return {
          statement: `Путешественник двигался ${t1} ч со скоростью ${v1} км/ч и затем ${t2} ч со скоростью ${v2} км/ч. Найдите его среднюю скорость на всём пути.`,
          answer: fracAnswer(dist, totalT),
          steps: [
            `Пройдено ${v1 * t1}+${v2 * t2}=${dist} км.`,
            `Общее время ${totalT} ч.`,
            `Средняя скорость ${dist}/${totalT} км/ч.`,
          ],
          hints: ['Средняя скорость — весь путь, делённый на всё время.'],
          taskType: 'word_problem',
          parameters: { v1, v2, t1, t2 },
        };
      }
      let v1 = rng.int(20, 55),
        v2 = rng.int(v1 + 10, v1 + 45),
        catchT = rng.int(1, 8);
      let delayNum = (v2 - v1) * catchT;
      let tries = 0;
      while (delayNum % v1 !== 0 && tries++ < 30) {
        catchT += 1;
        delayNum = (v2 - v1) * catchT;
      }
      if (delayNum % v1 !== 0) return null;
      const delay = delayNum / v1;
      if (a.difficulty === 4)
        return {
          statement: `Первый автомобиль выехал со скоростью ${v1} км/ч. Через ${delay} ч вслед за ним выехал второй со скоростью ${v2} км/ч. Через сколько часов после своего выезда второй автомобиль догонит первый?`,
          answer: numberAnswer(catchT),
          steps: [
            `Фора первого: ${v1}·${delay}=${v1 * delay} км.`,
            `Скорость сближения ${v2}-${v1}=${v2 - v1} км/ч.`,
            `Время догонки ${v1 * delay}:${v2 - v1}=${catchT} ч.`,
          ],
          hints: ['Найдите расстояние форы и относительную скорость.'],
          taskType: 'word_problem',
          parameters: { v1, v2, delay, catchT },
        };
      const extra = rng.int(1, 4);
      const totalAfter = v2 * (catchT + extra);
      const firstAfter = v1 * (delay + catchT + extra);
      const gap = totalAfter - firstAfter;
      return {
        statement: `Первый автомобиль едет со скоростью ${v1} км/ч. Через ${delay} ч за ним выезжает второй со скоростью ${v2} км/ч. Через сколько часов после выезда второго расстояние между автомобилями впервые снова станет равно ${gap} км уже после обгона?`,
        answer: numberAnswer(catchT + extra),
        steps: [
          `До встречи второй ликвидирует фору ${v1 * delay} км со скоростью сближения ${v2 - v1} км/ч, это занимает ${catchT} ч.`,
          `После встречи расстояние растёт со скоростью ${v2 - v1} км/ч.`,
          `Чтобы получить ${gap} км, нужно ещё ${extra} ч. Итого ${catchT + extra} ч после выезда второго.`,
        ],
        hints: ['Разделите движение на этап до встречи и после встречи.'],
        taskType: 'word_problem',
        parameters: { v1, v2, delay, catchT, extra, gap },
      };
    }
    case 'work_rate': {
      let ta = rng.int(4, 36),
        tb = rng.int(4, 36);
      if (ta === tb) tb += rng.int(1, 6);
      if (a.difficulty === 3) {
        const joint = (ta * tb) / (ta + tb);
        return {
          statement: `Один исполнитель выполняет работу за ${ta} ч, второй — за ${tb} ч. За сколько часов они выполнят её вместе, работая с постоянной производительностью?`,
          answer: fracAnswer(ta * tb, ta + tb),
          steps: [
            `Производительности: 1/${ta} и 1/${tb} работы в час.`,
            `Совместная производительность: 1/${ta}+1/${tb}=${ta + tb}/${ta * tb}.`,
            `Время равно ${joint} ч.`,
          ],
          hints: ['Складываются производительности, а не времена.'],
          taskType: 'word_problem',
          parameters: { ta, tb },
        };
      }
      if (a.difficulty === 4) {
        const solo = rng.int(1, Math.max(1, Math.floor(ta / 3)));
        const remN = ta - solo,
          remD = ta;
        const rateN = ta + tb,
          rateD = ta * tb;
        const jointN = remN * rateD,
          jointD = remD * rateN;
        const [jn, jd] = reduce(jointN, jointD);
        const totalN = solo * jd + jn;
        return {
          statement: `Первый исполнитель может выполнить работу за ${ta} ч, второй — за ${tb} ч. Первый работал один ${solo} ч, затем к нему присоединился второй. Через сколько часов от начала работа будет закончена?`,
          answer: fracAnswer(totalN, jd),
          steps: [
            `За ${solo} ч первый сделал ${solo}/${ta} работы; осталось ${ta - solo}/${ta}.`,
            `Совместная производительность равна 1/${ta}+1/${tb}.`,
            `На остаток потребуется ${jn}/${jd} ч; полное время ${totalN}/${jd} ч.`,
          ],
          hints: ['Сначала вычтите работу, выполненную первым в одиночку.'],
          taskType: 'word_problem',
          parameters: { ta, tb, solo },
        };
      }
      const times = [rng.int(5, 36), rng.int(6, 40), rng.int(7, 45)] as [number, number, number];
      const rateNum = times.reduce((s, t) => s + (times[0] * times[1] * times[2]) / t, 0);
      const common = times[0] * times[1] * times[2];
      return {
        statement: `Три исполнителя выполняют одну и ту же работу по отдельности за ${times[0]}, ${times[1]} и ${times[2]} ч. За сколько часов они выполнят работу вместе?`,
        answer: fracAnswer(common, rateNum),
        steps: [
          `Их производительности: 1/${times[0]}, 1/${times[1]}, 1/${times[2]}.`,
          `Суммарная производительность равна ${rateNum}/${common} работы в час.`,
          `Время — обратная величина: ${common}/${rateNum} ч.`,
        ],
        hints: ['Сложите три производительности.'],
        taskType: 'word_problem',
        parameters: { times },
      };
    }
    case 'mixture_ratio': {
      const ra = rng.int(2, 7),
        rb = rng.int(2, 8),
        k = rng.int(5, 25),
        A = ra * k,
        B = rb * k,
        total = A + B;
      if (a.difficulty === 3) {
        return {
          statement: `Два вида материала смешали в отношении ${ra}:${rb}; всего получилось ${total} кг смеси. Сколько килограммов материала первого вида в смеси?`,
          answer: numberAnswer(A),
          steps: [
            `Всего ${ra + rb} частей.`,
            `Одна часть ${total}:${ra + rb}=${k} кг.`,
            `Первого материала ${ra}·${k}=${A} кг.`,
          ],
          hints: ['Разделите общую массу на число частей.'],
          taskType: 'word_problem',
          parameters: { ra, rb, k },
        };
      }
      if (a.difficulty === 4) {
        const targetRa = ra + rng.int(1, 4);
        const add = targetRa * k - A;
        return {
          statement: `В смеси количества двух компонентов относятся как ${ra}:${rb}, всего смеси ${total} кг. Сколько килограммов первого компонента нужно добавить, чтобы отношение стало ${targetRa}:${rb}?`,
          answer: numberAnswer(add),
          steps: [
            `Изначально компонентов ${A} и ${B} кг.`,
            `Второй компонент не меняется: одна часть нового отношения равна ${B}/${rb}=${k}.`,
            `Первого должно стать ${targetRa * k} кг, поэтому добавить нужно ${add} кг.`,
          ],
          hints: ['Второй компонент остаётся неизменным.'],
          taskType: 'word_problem',
          parameters: { ra, rb, k, targetRa, add },
        };
      }
      const transfer = rng.int(1, Math.max(1, Math.floor(B / 3)));
      const A2 = A + transfer,
        B2 = B - transfer,
        [nr, nd] = reduce(A2, B2);
      return {
        statement: `В двух группах количество предметов относится как ${ra}:${rb}; всего предметов ${total}. Некоторое число предметов переложили из второй группы в первую, после чего отношение стало ${nr}:${nd}. Сколько предметов переложили?`,
        answer: numberAnswer(transfer),
        steps: [
          `Изначально в группах ${A} и ${B} предметов.`,
          `Пусть перенесли x: (${A}+x)/(${B}-x)=${nr}/${nd}.`,
          `Решение этого линейного уравнения даёт x=${transfer}.`,
        ],
        hints: ['Общая сумма не меняется; изменяются обе части отношения.'],
        taskType: 'word_problem',
        parameters: { ra, rb, k, transfer, nr, nd },
      };
    }
    case 'linear_constructed': {
      const x0 = rng.int(-15, 20);
      let A = rng.int(2, 9),
        B = rng.int(1, 8);
      if (A === B) B += 1;
      const p = rng.int(-8, 8),
        q = rng.int(-12, 12),
        r = rng.int(-8, 8);
      const s = A * (x0 + p) + q - B * (x0 + r);
      if (a.difficulty === 3) {
        return {
          statement: `Решите уравнение ${A}(x${fmtSigned(p)})${fmtSigned(q)}=${B}(x${fmtSigned(r)})${fmtSigned(s)}.`,
          answer: numberAnswer(x0),
          steps: [
            `Раскроем скобки и перенесём члены с x в одну часть.`,
            `Получаем (${A}-${B})x=${B * r + s - (A * p + q)}.`,
            `Отсюда x=${x0}.`,
          ],
          hints: ['Раскройте скобки и соберите неизвестные в одной части.'],
          taskType: 'equation',
          parameters: { x0, A, B, p, q, r, s },
        };
      }
      const d1 = rng.pick([2, 3, 4, 5]),
        d2 = rng.pick([2, 3, 4, 5]);
      const C = rng.int(2, 8),
        D = rng.int(1, 7);
      if (C * d2 === D * d1) return null;
      const leftConst = d1 * rng.int(-8, 8) - C * x0;
      const rightConst = d2 * rng.int(-8, 8) - D * x0;
      const lv = (C * x0 + leftConst) / d1,
        rv = (D * x0 + rightConst) / d2;
      const adjust = lv - rv;
      const adjN = Math.round(adjust * d1 * d2);
      const adjD = d1 * d2;
      if (a.difficulty === 4) {
        return {
          statement: `Решите уравнение $\\frac{${C}x${fmtSigned(leftConst)}}{${d1}}-\\frac{${D}x${fmtSigned(rightConst)}}{${d2}}=\\frac{${adjN}}{${adjD}}$.`,
          answer: numberAnswer(x0),
          steps: [
            `Умножим уравнение на ${d1 * d2}.`,
            `После раскрытия скобок получается линейное уравнение с единственным корнем.`,
            `Подстановка и решение дают x=${x0}.`,
          ],
          hints: ['Избавьтесь от знаменателей общим множителем.'],
          taskType: 'equation',
          parameters: { x0, C, D, leftConst, rightConst, d1, d2, adjN, adjD },
        };
      }
      const M = rng.int(2, 7),
        N = rng.int(2, 6),
        u = rng.int(-7, 7),
        w = rng.int(-7, 7),
        K = M * (2 * x0 + u) - N * (x0 - w);
      return {
        statement: `Решите уравнение ${M}(2x${fmtSigned(u)})-${N}(x${fmtSigned(-w)})=${K}. После нахождения x вычислите 3x${fmtSigned(v)}.`,
        answer: numberAnswer(3 * x0 + v),
        steps: [
          `Раскроем скобки: ${2 * M}x${fmtSigned(M * u)}-${N}x${fmtSigned(N * w)}=${K}.`,
          `Решение линейного уравнения даёт x=${x0}.`,
          `Тогда 3x${fmtSigned(v)}=${3 * x0 + v}.`,
        ],
        hints: ['Сначала найдите x, затем вычислите требуемое выражение.'],
        taskType: 'equation',
        parameters: { x0, M, N, u, w, K, v },
      };
    }
    case 'system_constructed': {
      const x = rng.int(-10, 15),
        y = rng.int(-10, 15);
      let a1 = rng.int(1, 7),
        b1 = rng.int(1, 7),
        a2 = rng.int(1, 7),
        b2 = rng.int(1, 7);
      if (a1 * b2 === a2 * b1) b2 += 1;
      const c1 = a1 * x + b1 * y,
        c2 = a2 * x + b2 * y;
      const ask = a.difficulty === 3 ? x + y : a.difficulty === 4 ? 2 * x - y : 3 * x + 2 * y;
      const expr = a.difficulty === 3 ? 'x+y' : a.difficulty === 4 ? '2x-y' : '3x+2y';
      return {
        statement: `Дана система $\\begin{cases}${a1}x+${b1}y=${c1}\\\\${a2}x+${b2}y=${c2}\\end{cases}$. Решите её и найдите ${expr}.`,
        answer: numberAnswer(ask),
        steps: [
          `Определитель системы ненулевой, поэтому решение единственно.`,
          `Методом сложения или подстановки получаем x=${x}, y=${y}.`,
          `Следовательно, ${expr}=${ask}.`,
        ],
        hints: ['Удобно исключить одну переменную методом сложения.'],
        taskType: 'equation',
        parameters: { x, y, a1, b1, a2, b2, c1, c2, expr },
      };
    }
    case 'polynomial_factor': {
      const m = rng.int(2, 9),
        n = rng.int(2, 12),
        k = rng.int(1, 8);
      if (a.difficulty === 3) {
        const outer = rng.int(1, 12);
        return {
          statement: `Разложите на множители выражение ${outer * m * m}x^2-${outer * n * n}.`,
          answer: exprAnswer(`${outer}(${m}x-${n})(${m}x+${n})`),
          steps: [
            `Выносим числовой множитель ${outer}: ${outer}((${m}x)^2-${n}^2).`,
            `В скобках разность квадратов: a²-b²=(a-b)(a+b).`,
            `Получаем ${outer}(${m}x-${n})(${m}x+${n}).`,
          ],
          hints: [
            'Сначала вынесите общий числовой множитель, затем используйте разность квадратов.',
          ],
          taskType: 'expression',
          parameters: { m, n, outer },
        };
      }
      if (a.difficulty === 4) {
        return {
          statement: `Разложите на множители: ${m * m}x^2-${2 * m * n}x+${n * n - k * k}.`,
          answer: exprAnswer(`(${m}x-${n - k})(${m}x-${n + k})`),
          steps: [
            `Первые три слагаемых дополним до квадрата: (${m}x-${n})²-${k * k}.`,
            `Это разность квадратов.`,
            `Получаем (${m}x-${n - k})(${m}x-${n + k}).`,
          ],
          hints: ['Попробуйте увидеть квадрат двучлена и разность квадратов.'],
          taskType: 'expression',
          parameters: { m, n, k },
        };
      }
      const p = rng.int(2, 8),
        q = rng.int(1, 10),
        s = rng.int(-8, 8);
      return {
        statement: `Разложите на множители: ${p}x(x${fmtSigned(s)})-${q}(x${fmtSigned(s)}).`,
        answer: exprAnswer(`(x${fmtSigned(s)})(${p}x-${q})`),
        steps: [
          `Обе части содержат общий множитель (x${fmtSigned(s)}).`,
          `Выносим его за скобки.`,
          `Получаем (x${fmtSigned(s)})(${p}x-${q}).`,
        ],
        hints: ['Ищите общий двучленный множитель.'],
        taskType: 'expression',
        parameters: { p, q, s },
      };
    }
    case 'function_line': {
      let x0 = rng.int(-8, 8);
      if (x0 === 0) x0 = 1;
      const y0 = rng.int(-15, 20);
      let m1 = rng.int(-6, 6),
        m2 = rng.int(-6, 6);
      if (m1 === m2) m2 += 2;
      const b1 = y0 - m1 * x0,
        b2 = y0 - m2 * x0;
      if (a.difficulty === 3) {
        return {
          statement: `Найдите абсциссу точки пересечения графиков y=${m1}x${fmtSigned(b1)} и y=${m2}x${fmtSigned(b2)}.`,
          answer: numberAnswer(x0),
          steps: [
            `В точке пересечения значения функций равны.`,
            `Решаем ${m1}x${fmtSigned(b1)}=${m2}x${fmtSigned(b2)}.`,
            `Получаем x=${x0}.`,
          ],
          hints: ['Приравняйте правые части формул.'],
          taskType: 'function',
          parameters: { x0, y0, m1, m2, b1, b2 },
        };
      }
      if (a.difficulty === 4) {
        return {
          statement: `Графики y=${m1}x${fmtSigned(b1)} и y=${m2}x${fmtSigned(b2)} пересекаются в точке (x;y). Найдите x+y.`,
          answer: numberAnswer(x0 + y0),
          steps: [
            `Приравниваем функции и получаем x=${x0}.`,
            `Подставляем x в любую функцию: y=${y0}.`,
            `x+y=${x0 + y0}.`,
          ],
          hints: ['Сначала найдите координаты точки пересечения.'],
          taskType: 'function',
          parameters: { x0, y0, m1, m2, b1, b2 },
        };
      }
      const k = rng.int(-7, 7);
      const c = y0 - k * x0;
      return {
        statement: `Две прямые y=${m1}x${fmtSigned(b1)} и y=${m2}x${fmtSigned(b2)} пересекаются в точке P. Прямая y=tx${fmtSigned(c)} также проходит через P. Найдите t.`,
        answer: numberAnswer(k),
        steps: [
          `Из первых двух уравнений находим P(${x0};${y0}).`,
          `Подставляем координаты P в y=tx${fmtSigned(c)}: ${y0}=${x0}t${fmtSigned(c)}.`,
          `Отсюда t=${k}.`,
        ],
        hints: ['Сначала найдите точку пересечения первых двух прямых.'],
        taskType: 'function',
        parameters: { x0, y0, m1, m2, b1, b2, k, c },
      };
    }
    case 'quadratic_roots': {
      let r1 = rng.int(-12, 12),
        r2 = rng.int(-12, 12);
      if (r1 === r2) r2 += 3;
      if (a.difficulty === 5 && (r1 === 0 || r2 === 0)) return null;
      const S = r1 + r2,
        P = r1 * r2;
      const poly = `x^2${fmtSigned(-S)}x${fmtSigned(P)}=0`;
      if (a.difficulty === 3) {
        const roots = [r1, r2].sort((x, y) => x - y);
        return {
          statement: `Решите уравнение ${poly}.`,
          answer: exprAnswer(`${roots[0]};${roots[1]}`),
          steps: [
            `По теореме Виета сумма корней ${S}, произведение ${P}.`,
            `Подходящие числа: ${roots[0]} и ${roots[1]}.`,
            `Ответ: ${roots.join('; ')}.`,
          ],
          hints: ['Используйте теорему Виета.'],
          taskType: 'equation',
          parameters: { r1, r2, S, P },
        };
      }
      if (a.difficulty === 4) {
        const val = S * S - 2 * P;
        return {
          statement: `Корни x₁ и x₂ уравнения ${poly}. Не находя их по отдельности, вычислите x₁²+x₂².`,
          answer: numberAnswer(val),
          steps: [
            `По Виету x₁+x₂=${S}, x₁x₂=${P}.`,
            `x₁²+x₂²=(x₁+x₂)²-2x₁x₂.`,
            `Получаем ${S}²-2·(${P})=${val}.`,
          ],
          hints: ['Выразите сумму квадратов через сумму и произведение корней.'],
          taskType: 'equation',
          parameters: { r1, r2, S, P },
        };
      }
      const [nn, dd] = reduce(S, P);
      return {
        statement: `Корни x₁ и x₂ уравнения ${poly}. Вычислите $\\frac1{x_1}+\\frac1{x_2}$.`,
        answer: fracAnswer(S, P),
        steps: [
          `По Виету x₁+x₂=${S}, x₁x₂=${P}.`,
          `1/x₁+1/x₂=(x₁+x₂)/(x₁x₂).`,
          `Получаем ${nn}/${dd}.`,
        ],
        hints: ['Сложите дроби символически и примените теорему Виета.'],
        taskType: 'equation',
        parameters: { r1, r2, S, P },
      };
    }
    case 'quadratic_parameter': {
      if (a.difficulty === 3) {
        const rootBound = 25 + a.grade * 3 + a.variant * 5,
          r = rng.int(-rootBound, rootBound),
          lead = rng.int(1, 20),
          p = -2 * lead * r,
          q = lead * r * r;
        return {
          statement: `Уравнение ${lead}x²+px${fmtSigned(q)}=0 имеет двойной корень x=${r}. Найдите p.`,
          answer: numberAnswer(p),
          steps: [
            `Для квадратного трёхчлена с двойным корнем r имеем ${lead}(x-${r})².`,
            `Коэффициент при x равен -2·${lead}·${r}.`,
            `Следовательно, p=${p}.`,
          ],
          hints: ['Представьте многочлен как a(x-r)².'],
          taskType: 'equation',
          parameters: { r, lead, p, q },
        };
      }
      const bound = 12 + (a.grade - 8) * 8 + a.variant * 3;
      let r1 = rng.int(-bound, bound),
        r2 = rng.int(-bound, bound);
      if (r1 === r2) r2 += 2;
      const diff = Math.abs(r1 - r2),
        P = r1 * r2,
        S = r1 + r2,
        lead = rng.int(1, 9);
      if (a.difficulty === 4) {
        return {
          statement: `Квадратное уравнение ${lead}x²-${lead}s·x${fmtSigned(lead * P)}=0 имеет два корня, разность которых по модулю равна ${diff}. Известно, что их сумма положительна. Найдите s.`,
          answer: numberAnswer(Math.abs(S)),
          steps: [
            `После деления на ${lead} по Виету сумма корней равна s, произведение ${P}.`,
            `Пара чисел с произведением ${P} и разностью по модулю ${diff} имеет сумму по модулю ${Math.abs(S)}.`,
            `Так как сумма положительна, s=${Math.abs(S)}.`,
          ],
          hints: [
            'Сначала разделите уравнение на старший коэффициент, затем примените теорему Виета.',
          ],
          taskType: 'equation',
          parameters: { r1, r2, diff, P, S, lead },
        };
      }
      if (r1 === 0 || r2 === 0) return null;
      const shift = rng.int(-10, 10),
        m = S - shift;
      return {
        statement: `Уравнение ${lead}x²-${lead}(m${fmtSigned(shift)})x${fmtSigned(lead * P)}=0 имеет ненулевые корни x₁ и x₂, причём |x₁-x₂|=${diff}. Найдите m, если x₁+x₂=${S}.`,
        answer: numberAnswer(m),
        steps: [
          `Делим уравнение на ${lead}. По условию сумма корней равна ${S}.`,
          `По Виету x₁+x₂=m${fmtSigned(shift)}.`,
          `Следовательно, m=${S}-${shift}=${m}.`,
        ],
        hints: ['Используйте сумму корней после нормировки квадратного уравнения.'],
        taskType: 'equation',
        parameters: { r1, r2, diff, P, S, shift, m, lead },
      };
    }
    case 'rational_equation': {
      if (a.difficulty <= 4) {
        let p = rng.int(-8, 8),
          q = rng.int(-8, 8);
        if (p === q) q += 3;
        let x0 = rng.int(-15, 15);
        if (x0 === p || x0 === q) return null;
        const A = rng.int(1, 9);
        const num = A * (x0 - q),
          den = x0 - p;
        if (num % den !== 0) return null;
        const B = num / den;
        if (B === 0 || A === B) return null;
        return {
          statement: `Решите уравнение $\\frac{${A}}{x${fmtSigned(-p)}}=\\frac{${B}}{x${fmtSigned(-q)}}$.`,
          answer: numberAnswer(x0),
          steps: [
            `ОДЗ: x≠${p}, x≠${q}.`,
            `После перемножения крест-накрест: ${A}(x${fmtSigned(-q)})=${B}(x${fmtSigned(-p)}).`,
            `Решение линейного уравнения даёт x=${x0}; оно входит в ОДЗ.`,
          ],
          hints: ['Запишите ОДЗ и перемножьте крест-накрест.'],
          taskType: 'equation',
          parameters: { p, q, x0, A, B },
        };
      }
      const a0 = rng.int(4, 40);
      const divisors = [] as number[];
      for (let d = 2; d < a0 * a0; d++) if ((a0 * a0) % d === 0 && d !== a0) divisors.push(d);
      if (!divisors.length) return null;
      const x0 = rng.pick(divisors);
      if (x0 === a0 || x0 === -a0) return null;
      const other = -(a0 * a0) / x0;
      if (!Number.isInteger(other) || other === a0 || other === -a0 || other === x0) return null;
      const cNum = 2 * x0,
        cDen = x0 * x0 - a0 * a0;
      const [cn, cd] = reduce(cNum, cDen);
      const roots = [x0, other].sort((x, y) => x - y);
      return {
        statement: `Решите уравнение $\\frac1{x-${a0}}+\\frac1{x+${a0}}=\\frac{${cn}}{${cd}}$.`,
        answer: exprAnswer(`${roots[0]};${roots[1]}`),
        steps: [
          `ОДЗ: x≠±${a0}.`,
          `Левая часть равна 2x/(x²-${a0 * a0}). После умножения на знаменатели получаем квадратное уравнение.`,
          `Его допустимые корни: ${roots.join(' и ')}.`,
        ],
        hints: ['Сложите дроби в левой части, не забывая ОДЗ.'],
        taskType: 'equation',
        parameters: { a0, x0, other, cn, cd },
      };
    }
    case 'sequence_ap': {
      const a1 = rng.int(-20, 30),
        d = rng.int(2, 12) * (rng.next() < 0.25 ? -1 : 1),
        m = rng.int(2, 7),
        n = rng.int(m + 2, 14),
        am = a1 + (m - 1) * d,
        an = a1 + (n - 1) * d;
      if (a.difficulty === 3) {
        const k = rng.int(n + 1, n + 6),
          ak = a1 + (k - 1) * d;
        return {
          statement: `В арифметической прогрессии a_${m}=${am}, a_${n}=${an}. Найдите a_${k}.`,
          answer: numberAnswer(ak),
          steps: [
            `a_${n}-a_${m}=(${n}-${m})d, поэтому d=${d}.`,
            `a₁=${am}-(${m}-1)·${d}=${a1}.`,
            `a_${k}=${a1}+(${k}-1)·${d}=${ak}.`,
          ],
          hints: ['Сначала найдите разность прогрессии по двум известным членам.'],
          taskType: 'short_answer',
          parameters: { a1, d, m, n, am, an, k, ak },
        };
      }
      const N = rng.int(8, 20),
        S = (N * (2 * a1 + (N - 1) * d)) / 2;
      if (!Number.isInteger(S)) return null;
      if (a.difficulty === 4) {
        return {
          statement: `Арифметическая прогрессия задана условиями a_${m}=${am}, a_${n}=${an}. Найдите сумму первых ${N} членов.`,
          answer: numberAnswer(S),
          steps: [
            `Из двух членов находим d=${d} и a₁=${a1}.`,
            `Используем S_n=n(2a₁+(n-1)d)/2.`,
            `S_${N}=${S}.`,
          ],
          hints: ['Восстановите a₁ и d, затем примените формулу суммы.'],
          taskType: 'short_answer',
          parameters: { a1, d, m, n, am, an, N, S },
        };
      }
      const target = a1 + (N - 1) * d;
      return {
        statement: `В арифметической прогрессии a_${m}=${am}, а сумма первых ${N} членов равна ${S}. Найдите a_${N}.`,
        answer: numberAnswer(target),
        steps: [
          `S_${N}=${N}(a₁+a_${N})/2, а a_${m}=a₁+(${m}-1)d.`,
          `Совместное использование этих связей восстанавливает d=${d}, a₁=${a1}.`,
          `Следовательно, a_${N}=${target}.`,
        ],
        hints: [
          'Используйте одновременно формулу члена и формулу суммы через первый и последний члены.',
        ],
        taskType: 'short_answer',
        parameters: { a1, d, m, am, N, S, target },
      };
    }
    case 'sequence_gp': {
      const q = rng.pick([2, 3, 4]),
        a1 = rng.int(1, 8),
        m = rng.int(2, 4),
        n = m + rng.int(2, 4),
        am = a1 * q ** (m - 1),
        an = a1 * q ** (n - 1);
      if (a.difficulty === 4) {
        const k = n + 1,
          ak = a1 * q ** (k - 1);
        return {
          statement: `В геометрической прогрессии b_${m}=${am}, b_${n}=${an}, знаменатель положителен. Найдите b_${k}.`,
          answer: numberAnswer(ak),
          steps: [`b_${n}/b_${m}=q^${n - m}=${an / am}.`, `Отсюда q=${q}.`, `Тогда b_${k}=${ak}.`],
          hints: ['Разделите более поздний член на более ранний.'],
          taskType: 'short_answer',
          parameters: { q, a1, m, n, am, an, k, ak },
        };
      }
      const N = rng.int(5, 8),
        S = (a1 * (q ** N - 1)) / (q - 1);
      return {
        statement: `Геометрическая прогрессия имеет положительный знаменатель. Известно, что b_${m}=${am}, b_${n}=${an}. Найдите сумму первых ${N} членов.`,
        answer: numberAnswer(S),
        steps: [
          `По отношению двух членов находим q=${q}.`,
          `Затем b₁=${a1}.`,
          `S_${N}=b₁(q^${N}-1)/(q-1)=${S}.`,
        ],
        hints: ['Сначала определите знаменатель и первый член.'],
        taskType: 'short_answer',
        parameters: { q, a1, m, n, am, an, N, S },
      };
    }
    case 'triangle_angle': {
      const A = rng.int(25, 80),
        B = rng.int(25, Math.min(100, 145 - A)),
        C = 180 - A - B;
      if (C <= 15) return null;
      if (a.difficulty === 3) {
        const ext = 180 - C;
        return {
          statement: `В треугольнике ABC угол A равен ${A}°, а внешний угол при вершине C равен ${ext}°. Найдите угол B.`,
          answer: numberAnswer(B),
          steps: [
            `Внешний угол при C равен сумме удалённых внутренних углов A и B.`,
            `Поэтому ${ext}=${A}+B.`,
            `B=${B}°.`,
          ],
          hints: ['Используйте теорему о внешнем угле треугольника.'],
          taskType: 'geometry',
          figure: {
            kind: 'triangle',
            points: [
              { id: 'A', x: 0, y: 0 },
              { id: 'B', x: 6, y: 0 },
              { id: 'C', x: 2, y: 4 },
            ],
            angleLabels: { A, B },
          },
          parameters: { A, B, C },
        };
      }
      if (a.difficulty === 4) {
        const halfB = B / 2;
        if (!Number.isInteger(halfB)) return null;
        return {
          statement: `В треугольнике ABC ∠A=${A}°, ∠C=${C}°. Биссектриса угла B пересекает AC в точке D. Найдите угол CBD.`,
          answer: numberAnswer(halfB),
          steps: [
            `∠B=180°-${A}°-${C}°=${B}°.`,
            `BD — биссектриса, поэтому делит угол B пополам.`,
            `∠CBD=${B}/2=${halfB}°.`,
          ],
          hints: ['Сначала найдите третий угол треугольника.'],
          taskType: 'geometry',
          figure: {
            kind: 'triangle_bisector',
            angles: { A, B, C },
            bisectorFrom: 'B',
            labels: true,
          },
          parameters: { A, B, C },
        };
      }
      let ratioA = rng.int(1, 6),
        ratioB = rng.int(1, 6);
      if (ratioA === ratioB) ratioB += 1;
      const unit = rng.int(5, Math.max(5, Math.floor(150 / (ratioA + ratioB))));
      const base = (ratioA + ratioB) * unit,
        A2 = ratioA * unit,
        B2 = ratioB * unit,
        C2 = 180 - base;
      if (C2 <= 10) return null;
      return {
        statement: `В треугольнике два угла относятся как ${ratioA}:${ratioB}, а внешний угол при третьей вершине равен ${base}°. Найдите больший из этих двух углов.`,
        answer: numberAnswer(Math.max(A2, B2)),
        steps: [
          `Внешний угол равен сумме двух удалённых внутренних углов, то есть ${base}°.`,
          `Пусть углы ${ratioA}x и ${ratioB}x. Тогда ${ratioA + ratioB}x=${base}, откуда x=${unit}.`,
          `Больший угол равен ${Math.max(A2, B2)}°.`,
        ],
        hints: ['Внешний угол равен сумме двух несмежных внутренних.'],
        taskType: 'geometry',
        parameters: { ratioA, ratioB, unit, base, A2, B2, C2 },
      };
    }
    case 'right_triangle': {
      const [u, vv, w] = rng.pick(triples),
        scale = rng.int(1, 20),
        x = u * scale,
        y = vv * scale,
        c = w * scale,
        area = (x * y) / 2;
      if (a.difficulty === 3) {
        return {
          statement: `Катеты прямоугольного треугольника равны ${x} см и ${y} см. Найдите его площадь.`,
          answer: numberAnswer(area),
          steps: [
            `Площадь прямоугольного треугольника равна половине произведения катетов.`,
            `S=${x}·${y}/2=${area} см².`,
          ],
          hints: ['Катеты являются основанием и высотой.'],
          taskType: 'geometry',
          figure: { kind: 'right_triangle', legs: [x, y], hypotenuse: c },
          parameters: { x, y, c },
        };
      }
      if (a.difficulty === 4) {
        return {
          statement: `В прямоугольном треугольнике катеты равны ${x} см и ${y} см. Найдите длину высоты, опущенной на гипотенузу.`,
          answer: fracAnswer(x * y, c),
          steps: [
            `Гипотенуза по Пифагору равна ${c} см.`,
            `Площадь можно записать как xy/2 и как ch/2.`,
            `Следовательно, h=xy/c=${x * y}/${c}.`,
          ],
          hints: ['Вычислите площадь двумя способами.'],
          taskType: 'geometry',
          figure: {
            kind: 'right_triangle_altitude',
            hypotenuseSegments: [],
            altitude: null,
            labels: true,
          },
          parameters: { x, y, c },
        };
      }
      return {
        statement: `Гипотенуза прямоугольного треугольника равна ${c} см, один катет — ${x} см. Найдите произведение площади треугольника на 2.`,
        answer: numberAnswer(x * y),
        steps: [
          `Второй катет по теореме Пифагора: √(${c * c}-${x * x})=${y}.`,
          `Удвоенная площадь равна произведению катетов.`,
          `2S=${x}·${y}=${x * y}.`,
        ],
        hints: ['Сначала восстановите второй катет.'],
        taskType: 'geometry',
        figure: { kind: 'right_triangle', legs: [x, y], hypotenuse: c },
        parameters: { x, y, c },
      };
    }
    case 'similarity': {
      const base = rng.int(3, 15),
        side2 = rng.int(4, 18),
        k = rng.int(2, 6),
        small = [base, side2],
        big = [base * k, side2 * k];
      if (a.difficulty === 3) {
        return {
          statement: `Два треугольника подобны. Стороне ${base} см первого соответствует сторона ${base * k} см второго. Какова длина стороны второго треугольника, соответствующей стороне ${side2} см первого?`,
          answer: numberAnswer(side2 * k),
          steps: [
            `Коэффициент подобия равен ${base * k}/${base}=${k}.`,
            `Соответствующая сторона увеличивается в ${k} раз.`,
            `Искомая длина ${side2}·${k}=${side2 * k} см.`,
          ],
          hints: ['Найдите коэффициент подобия.'],
          taskType: 'geometry',
          parameters: { base, side2, k },
        };
      }
      if (a.difficulty === 4) {
        return {
          statement: `Площади двух подобных треугольников относятся как 1:${k * k}. Периметр меньшего равен ${rng.int(15, 50) * k} см и кратен ${k}. Во сколько раз периметр большего больше периметра меньшего?`,
          answer: numberAnswer(k),
          steps: [
            `Отношение площадей равно квадрату коэффициента подобия.`,
            `Коэффициент подобия √${k * k}=${k}.`,
            `Периметры относятся с тем же коэффициентом ${k}.`,
          ],
          hints: ['Площади масштабируются как квадрат линейного коэффициента.'],
          taskType: 'geometry',
          parameters: { k },
        };
      }
      const pSmall = (base + side2 + rng.int(5, 20)) * 2;
      const pBig = pSmall * k;
      return {
        statement: `Два подобных многоугольника имеют коэффициент подобия ${k}. Периметр большего равен ${pBig} см. Площадь меньшего равна ${base * side2} см². Найдите периметр меньшего и запишите его числом.`,
        answer: numberAnswer(pSmall),
        steps: [
          `Периметры подобных фигур относятся как коэффициент подобия ${k}.`,
          `Поэтому меньший периметр равен ${pBig}:${k}=${pSmall} см.`,
          `Данные о площади здесь служат дополнительной проверкой масштаба.`,
        ],
        hints: ['Для периметров используется линейный, а не квадратный коэффициент.'],
        taskType: 'geometry',
        parameters: { k, pSmall, pBig },
      };
    }
    case 'trapezoid': {
      const [u, h, l] = rng.pick(triples),
        scale = rng.int(1, 4),
        half = u * scale,
        height = h * scale,
        leg = l * scale,
        b1 = rng.int(8, 35),
        b2 = b1 + 2 * half,
        area = ((b1 + b2) * height) / 2;
      if (a.difficulty === 3) {
        return {
          statement: `Основания трапеции равны ${b1} см и ${b2} см, высота — ${height} см. Найдите площадь.`,
          answer: numberAnswer(area),
          steps: [`S=(a+b)h/2.`, `S=(${b1}+${b2})·${height}/2=${area} см².`],
          hints: ['Используйте формулу площади трапеции.'],
          taskType: 'geometry',
          figure: { kind: 'isosceles_trapezoid', bases: [b1, b2], leg, height, labels: true },
          parameters: { b1, b2, height, leg },
        };
      }
      if (a.difficulty === 4) {
        return {
          statement: `Равнобедренная трапеция имеет основания ${b1} см и ${b2} см и боковую сторону ${leg} см. Найдите её площадь.`,
          answer: numberAnswer(area),
          steps: [
            `После опускания высот горизонтальная проекция боковой стороны равна (${b2}-${b1})/2=${half}.`,
            `Высота: √(${leg * leg}-${half * half})=${height}.`,
            `S=(${b1}+${b2})·${height}/2=${area}.`,
          ],
          hints: ['Опустите высоты и получите прямоугольный треугольник.'],
          taskType: 'geometry',
          figure: { kind: 'isosceles_trapezoid', bases: [b1, b2], leg, height, labels: true },
          parameters: { b1, b2, height, leg },
        };
      }
      return {
        statement: `Площадь равнобедренной трапеции равна ${area} см², а основания — ${b1} см и ${b2} см. Найдите её боковую сторону.`,
        answer: numberAnswer(leg),
        steps: [
          `Из формулы площади находим высоту: h=2S/(a+b)=${height}.`,
          `Половина разности оснований равна ${half}.`,
          `Боковая сторона по Пифагору: √(${height}²+${half}²)=${leg}.`,
        ],
        hints: ['Сначала найдите высоту из площади.'],
        taskType: 'geometry',
        figure: { kind: 'isosceles_trapezoid', bases: [b1, b2], leg, height, labels: true },
        parameters: { b1, b2, height, leg },
      };
    }
    case 'circle_chords': {
      const x = rng.int(2, 16),
        y = rng.int(2, 18),
        prod = x * y;
      const divisors = [] as number[];
      for (let d = 1; d <= prod; d++) if (prod % d === 0) divisors.push(d);
      const c = rng.pick(divisors),
        d = prod / c;
      if (a.difficulty <= 4) {
        return {
          statement: `Хорды AB и CD пересекаются в точке P. Известно: AP=${x}, PB=${y}, CP=${c}. Найдите PD.`,
          answer: numberAnswer(d),
          steps: [
            `Для пересекающихся хорд AP·PB=CP·PD.`,
            `Получаем ${x}·${y}=${c}·PD.`,
            `PD=${prod}/${c}=${d}.`,
          ],
          hints: ['Используйте произведения отрезков пересекающихся хорд.'],
          taskType: 'geometry',
          figure: {
            kind: 'intersecting_chords',
            segments: { AP: x, PB: y, CP: c, PD: d },
            labels: true,
          },
          parameters: { x, y, c, d },
        };
      }
      const sum = c + d;
      const small = Math.min(c, d);
      return {
        statement: `Хорды AB и CD пересекаются в точке P. AP=${x}, PB=${y}, а длина хорды CD равна ${sum}. Найдите меньший из отрезков CP и PD.`,
        answer: numberAnswer(small),
        steps: [
          `CP·PD=AP·PB=${prod}.`,
          `Пусть CP=t, тогда PD=${sum}-t. Получаем t(${sum}-t)=${prod}.`,
          `Корни — ${c} и ${d}; меньший отрезок равен ${small}.`,
        ],
        hints: ['Используйте одновременно сумму и произведение двух частей хорды.'],
        taskType: 'geometry',
        figure: {
          kind: 'intersecting_chords',
          segments: { AP: x, PB: y, CP: c, PD: d },
          labels: true,
        },
        parameters: { x, y, c, d, sum },
      };
    }
    case 'bisector': {
      let m = rng.int(2, 8),
        n = rng.int(2, 8);
      if (m === n) n += 1;
      const k = rng.int(2, 9),
        AB = m * k,
        AC = n * k,
        s = rng.int(2, 8),
        BD = m * s,
        DC = n * s,
        BC = BD + DC;
      if (a.difficulty === 3) {
        return {
          statement: `В треугольнике ABC биссектриса AD делит сторону BC. AB=${AB} см, AC=${AC} см, BC=${BC} см. Найдите BD.`,
          answer: numberAnswer(BD),
          steps: [
            `По теореме о биссектрисе BD/DC=AB/AC=${m}/${n}.`,
            `BC состоит из ${m + n} частей, одна часть ${BC}/${m + n}=${s}.`,
            `BD=${m}·${s}=${BD} см.`,
          ],
          hints: ['Биссектриса делит противоположную сторону пропорционально прилежащим сторонам.'],
          taskType: 'geometry',
          parameters: { m, n, AB, AC, BD, DC },
        };
      }
      if (a.difficulty === 4) {
        return {
          statement: `Биссектриса AD треугольника ABC делит BC на отрезки ${BD} см и ${DC} см. Сторона AB равна ${AB} см. Найдите AC.`,
          answer: numberAnswer(AC),
          steps: [`BD/DC=AB/AC.`, `Подставляем: ${BD}/${DC}=${AB}/AC.`, `Отсюда AC=${AC} см.`],
          hints: ['Составьте пропорцию по теореме о биссектрисе.'],
          taskType: 'geometry',
          parameters: { m, n, AB, AC, BD, DC },
        };
      }
      const per = AB + AC + BC;
      return {
        statement: `В треугольнике ABC биссектриса AD делит BC на отрезки ${BD} см и ${DC} см. Периметр треугольника равен ${per} см. Найдите большую из сторон AB и AC.`,
        answer: numberAnswer(Math.max(AB, AC)),
        steps: [
          `По теореме о биссектрисе AB:AC=${BD}:${DC}=${m}:${n}.`,
          `BC=${BC}, поэтому AB+AC=${per}-${BC}=${AB + AC}.`,
          `Делим эту сумму в отношении ${m}:${n}; получаем стороны ${AB} и ${AC}.`,
        ],
        hints: ['Сначала найдите сумму AB+AC из периметра.'],
        taskType: 'geometry',
        parameters: { m, n, AB, AC, BD, DC, per },
      };
    }
    case 'coordinate_geometry': {
      if (a.difficulty === 3) {
        const mx = rng.int(-10, 10),
          my = rng.int(-10, 10),
          dx = rng.int(1, 8),
          dy = rng.int(1, 8),
          A = [mx - dx, my - dy],
          B = [mx + dx, my + dy];
        return {
          statement: `Даны точки A(${A[0]};${A[1]}) и B(${B[0]};${B[1]}). Найдите сумму координат середины отрезка AB.`,
          answer: numberAnswer(mx + my),
          steps: [
            `Середина имеет координаты ((${A[0]}+${B[0]})/2; (${A[1]}+${B[1]})/2)=(${mx};${my}).`,
            `Сумма координат ${mx + my}.`,
          ],
          hints: ['Координаты середины — средние арифметические координат концов.'],
          taskType: 'geometry',
          figure: {
            kind: 'segment',
            points: [
              { id: 'A', x: A[0], y: A[1] },
              { id: 'B', x: B[0], y: B[1] },
            ],
          },
          parameters: { A, B, mx, my },
        };
      }
      const [u, vv, w] = rng.pick(triples),
        scale = rng.int(1, 5),
        x0 = rng.int(-10, 10),
        y0 = rng.int(-10, 10),
        A = [x0, y0],
        B = [x0 + u * scale, y0 + vv * scale];
      if (a.difficulty === 4) {
        return {
          statement: `Даны точки A(${A[0]};${A[1]}) и B(${B[0]};${B[1]}). Найдите расстояние AB.`,
          answer: numberAnswer(w * scale),
          steps: [
            `Разности координат равны ${u * scale} и ${vv * scale}.`,
            `AB=√(${u * scale}²+${vv * scale}²).`,
            `AB=${w * scale}.`,
          ],
          hints: ['Используйте формулу расстояния между точками.'],
          taskType: 'geometry',
          figure: {
            kind: 'segment',
            points: [
              { id: 'A', x: A[0], y: A[1] },
              { id: 'B', x: B[0], y: B[1] },
            ],
          },
          parameters: { A, B },
        };
      }
      const C = [x0, y0 + vv * scale];
      const area = (u * scale * vv * scale) / 2;
      return {
        statement: `Точки A(${A[0]};${A[1]}), B(${B[0]};${B[1]}) и C(${C[0]};${C[1]}) образуют треугольник. Найдите его площадь.`,
        answer: numberAnswer(area),
        steps: [
          `AC вертикален и равен ${vv * scale}.`,
          `Расстояние от B до прямой AC равно ${u * scale}.`,
          `S=${vv * scale}·${u * scale}/2=${area}.`,
        ],
        hints: ['Выберите вертикальный отрезок в качестве основания.'],
        taskType: 'geometry',
        parameters: { A, B, C, area },
      };
    }
    case 'trig_triangle': {
      const [u, vv, w] = rng.pick(triples),
        swap = rng.next() < 0.5,
        aLeg = swap ? vv : u,
        bLeg = swap ? u : vv;
      if (a.difficulty === 3) {
        const scale = rng.int(1, 24),
          opp = aLeg * scale,
          adj = bLeg * scale;
        return {
          statement: `В прямоугольном треугольнике относительно острого угла α противолежащий катет равен ${opp}, прилежащий — ${adj}. Найдите sin α.`,
          answer: fracAnswer(aLeg, w),
          steps: [
            `Гипотенуза равна ${w * scale} по теореме Пифагора.`,
            `sin α = противолежащий катет / гипотенуза = ${opp}/${w * scale}=${aLeg}/${w}.`,
          ],
          hints: ['Сначала найдите гипотенузу, затем используйте определение синуса.'],
          taskType: 'geometry',
          parameters: { aLeg, bLeg, w, scale, opp, adj },
        };
      }
      if (a.difficulty === 4) return generateTrigTriangleDifficulty4(a, rng);
      const scale = rng.int(2, 30),
        opp = aLeg * scale,
        adj = bLeg * scale,
        hyp = w * scale,
        area = (opp * adj) / 2,
        perimeter = opp + adj + hyp;
      return {
        statement: `В прямоугольном треугольнике sin α=$\\frac{${aLeg}}{${w}}$, а площадь равна ${area} см². Найдите периметр треугольника.`,
        answer: numberAnswer(perimeter),
        steps: [
          `Отношение противолежащего катета, прилежащего катета и гипотенузы равно ${aLeg}:${bLeg}:${w}.`,
          `Пусть коэффициент масштаба равен k. Тогда площадь равна ${aLeg}k·${bLeg}k/2=${area}, откуда k²=${scale * scale} и k=${scale}.`,
          `Стороны равны ${opp}, ${adj} и ${hyp} см, поэтому периметр равен ${perimeter} см.`,
        ],
        hints: [
          'Сначала восстановите отношение всех трёх сторон по синусу.',
          'Выразите площадь через коэффициент масштаба k.',
        ],
        taskType: 'geometry',
        figure: { kind: 'right_triangle', legs: [opp, adj], hypotenuse: hyp },
        parameters: { aLeg, bLeg, w, scale, opp, adj, hyp, area, perimeter },
      };
    }
    case 'trig_identity': {
      const [u, vv, w] = rng.pick(triples),
        swap = rng.next() < 0.5,
        s = swap ? vv : u,
        c = swap ? u : vv;
      if (a.difficulty === 3) {
        const mult = rng.int(2, 25);
        return {
          statement: `Известно, что sin α=$\\frac{${s}}{${w}}$, cos α=$\\frac{${c}}{${w}}$. Вычислите ${mult}·sin 2α.`,
          answer: fracAnswer(mult * 2 * s * c, w * w),
          steps: [
            `sin 2α=2sinα cosα.`,
            `Подставляем значения и умножаем на ${mult}.`,
            `Получаем ${mult * 2 * s * c}/${w * w}.`,
          ],
          hints: ['Сначала примените формулу двойного угла.'],
          taskType: 'calculation',
          parameters: { s, c, w, mult },
        };
      }
      if (a.difficulty === 4) {
        const mult = rng.int(2, 25);
        return {
          statement: `Для острого α известно tan α=$\\frac{${s}}{${c}}$. Вычислите ${mult}·cos 2α.`,
          answer: fracAnswer(mult * (c * c - s * s), c * c + s * s),
          steps: [
            `cos2α=(1-tan²α)/(1+tan²α).`,
            `После подстановки получаем (${c * c}-${s * s})/(${c * c}+${s * s}).`,
            `Умножаем результат на ${mult}.`,
          ],
          hints: ['Выразите cos2α через tanα.'],
          taskType: 'calculation',
          parameters: { s, c, w, mult },
        };
      }
      const add = rng.int(-20, 20);
      return {
        statement: `Известно, что sin α=$\\frac{${s}}{${w}}$, cos α=$\\frac{${c}}{${w}}$. Вычислите $(sin α+cos α)^2${fmtSigned(add)}$.`,
        answer: fracAnswer((s + c) * (s + c) + add * w * w, w * w),
        steps: [
          `(sinα+cosα)²=sin²α+cos²α+2sinαcosα.`,
          `Первые два слагаемых дают 1.`,
          `Подставляем значения и затем прибавляем ${add}.`,
        ],
        hints: ['Раскройте квадрат суммы и примените sin²α+cos²α=1.'],
        taskType: 'calculation',
        parameters: { s, c, w, add },
      };
    }
    case 'exponential': {
      const base = rng.int(2, 5);
      if (a.difficulty === 3) {
        const x0 = rng.int(-5, 8),
          p = rng.int(1, 4),
          q = rng.int(-6, 6),
          rhs = p * x0 + q;
        return {
          statement: `Решите уравнение ${base}^{${p}x${fmtSigned(q)}}=${base}^{${rhs}}.`,
          answer: numberAnswer(x0),
          steps: [
            `Основания одинаковы и не равны 1, значит показатели равны.`,
            `${p}x${fmtSigned(q)}=${rhs}.`,
            `x=${x0}.`,
          ],
          hints: ['Приравняйте показатели степеней.'],
          taskType: 'equation',
          parameters: { base, x0, p, q, rhs },
        };
      }
      if (a.difficulty === 4) {
        let r1 = rng.int(0, 6),
          r2 = rng.int(r1 + 1, 9);
        const shift = rng.int(-9, 9),
          y1 = base ** r1,
          y2 = base ** r2,
          S = y1 + y2,
          P = y1 * y2,
          sum = r1 + r2 - 2 * shift;
        return {
          statement: `Решите уравнение ${base}^{2(x${fmtSigned(shift)})}-${S}·${base}^{x${fmtSigned(shift)}}+${P}=0. Запишите сумму всех его корней.`,
          answer: numberAnswer(sum),
          steps: [
            `Положим t=${base}^{x${fmtSigned(shift)}}>0. Получаем t²-${S}t+${P}=0.`,
            `Корни по t: ${y1} и ${y2}, поэтому x${fmtSigned(shift)}=${r1} или ${r2}.`,
            `Сумма корней равна ${sum}.`,
          ],
          hints: ['Сделайте замену t=a^(x+c).'],
          taskType: 'equation',
          parameters: { base, r1, r2, shift, y1, y2, sum },
        };
      }
      const x0 = rng.int(1, 7),
        shift = rng.int(-12, 12),
        K = base ** x0 + base ** -x0,
        larger = x0 - shift;
      return {
        statement: `Найдите больший корень уравнения ${base}^{x${fmtSigned(shift)}}+${base}^{-(x${fmtSigned(shift)})}=${K}.`,
        answer: numberAnswer(larger),
        steps: [
          `Положим y=x${fmtSigned(shift)}. Получаем симметричное уравнение ${base}^y+${base}^{-y}=${K}.`,
          `Его корни y=±${x0}.`,
          `Большему корню соответствует y=${x0}, поэтому x=${x0}-${shift}=${larger}.`,
        ],
        hints: ['Сначала сделайте замену y=x+c и используйте симметрию.'],
        taskType: 'equation',
        parameters: { base, x0, shift, K, larger },
      };
    }
    case 'logarithm': {
      const base = rng.pick([2, 3, 4, 5]);
      if (a.difficulty === 3) {
        const k = rng.int(1, 5),
          shift = rng.int(-10, 10),
          x = base ** k + shift;
        return {
          statement: `Решите уравнение $\\log_{${base}}(x${fmtSigned(-shift)})=${k}$.`,
          answer: numberAnswer(x),
          steps: [
            `По определению логарифма x${fmtSigned(-shift)}=${base}^${k}=${base ** k}.`,
            `Отсюда x=${x}.`,
            `Аргумент логарифма положителен.`,
          ],
          hints: ['Перейдите от логарифмической записи к показательной.'],
          taskType: 'equation',
          parameters: { base, k, shift, x },
        };
      }
      if (a.difficulty === 4) {
        const k = rng.int(2, 6),
          P = base ** k;
        const divisors = [] as number[];
        for (let d = 1; d <= P; d++) if (P % d === 0) divisors.push(d);
        const f1 = rng.pick(divisors),
          f2 = P / f1,
          x0 = rng.int(Math.max(f1, f2) + 2, Math.max(f1, f2) + 30),
          aa = x0 - f1,
          cc = x0 - f2;
        return {
          statement: `Решите уравнение $\\log_{${base}}(x${fmtSigned(-aa)})+\\log_{${base}}(x${fmtSigned(-cc)})=${k}$.`,
          answer: numberAnswer(x0),
          steps: [
            `ОДЗ: оба аргумента положительны.`,
            `Объединяем логарифмы: (x${fmtSigned(-aa)})(x${fmtSigned(-cc)})=${base}^${k}=${P}.`,
            `Один корень равен ${x0}; второй не удовлетворяет ОДЗ. Поэтому ответ ${x0}.`,
          ],
          hints: ['Объедините сумму логарифмов в логарифм произведения.'],
          taskType: 'equation',
          parameters: { base, k, P, f1, f2, x0, aa, cc },
        };
      }
      const k = rng.int(1, 3),
        ratio = base ** k,
        x0 = rng.int(5, 30),
        cc = rng.int(-10, x0 - 2),
        aa = x0 - ratio * (x0 - cc);
      return {
        statement: `Решите уравнение $\\log_{${base}}\\left(\\frac{x${fmtSigned(-aa)}}{x${fmtSigned(-cc)}}\\right)=${k}$.`,
        answer: numberAnswer(x0),
        steps: [
          `ОДЗ требует положительности отношения и ненулевого знаменателя.`,
          `Переходим к уравнению (x${fmtSigned(-aa)})/(x${fmtSigned(-cc)})=${ratio}.`,
          `Линейное уравнение даёт x=${x0}; проверка ОДЗ выполняется.`,
        ],
        hints: ['Сначала замените логарифмическое равенство показательным.'],
        taskType: 'equation',
        parameters: { base, k, ratio, x0, aa, cc },
      };
    }
    case 'stereometry_prism': {
      if (a.difficulty < 5) {
        const x = rng.int(2, 12),
          y = rng.int(2, 12),
          h = rng.int(2, 15),
          V = x * y * h;
        if (a.difficulty === 3)
          return {
            statement: `Прямоугольный параллелепипед имеет размеры ${x}, ${y} и ${h}. Найдите его объём.`,
            answer: numberAnswer(V),
            steps: [`V=abc=${x}·${y}·${h}=${V}.`],
            hints: ['Перемножьте три измерения.'],
            taskType: 'geometry',
            figure: { kind: 'rectangular_prism', a: x, b: y, h },
            parameters: { x, y, h },
          };
        const S = 2 * (x * y + x * h + y * h);
        return {
          statement: `Объём прямоугольного параллелепипеда равен ${V}, две стороны основания — ${x} и ${y}. Найдите площадь полной поверхности.`,
          answer: numberAnswer(S),
          steps: [`Высота h=${V}/(${x}·${y})=${h}.`, `S=2(ab+ah+bh).`, `S=${S}.`],
          hints: ['Сначала восстановите третье измерение из объёма.'],
          taskType: 'geometry',
          figure: { kind: 'rectangular_prism', a: x, b: y, h },
          parameters: { x, y, h, V },
        };
      }
      const [x0, y0, h0, d0] = rng.pick(quadruples),
        scale = rng.int(1, 30),
        x = x0 * scale,
        y = y0 * scale,
        h = h0 * scale,
        d = d0 * scale,
        V = x * y * h;
      return {
        statement: `Пространственная диагональ прямоугольного параллелепипеда равна ${d}, две его стороны равны ${x} и ${y}. Найдите объём.`,
        answer: numberAnswer(V),
        steps: [
          `По пространственной теореме Пифагора h²=${d}²-${x}²-${y}².`,
          `h=${h}.`,
          `V=${x}·${y}·${h}=${V}.`,
        ],
        hints: ['Используйте d²=a²+b²+c².'],
        taskType: 'geometry',
        figure: { kind: 'rectangular_prism', a: x, b: y, h },
        parameters: { x, y, h, d },
      };
    }
    case 'stereometry_pyramid': {
      const [u, h0, l] = rng.pick(triples),
        scale = rng.int(1, 20),
        half = u * scale,
        aSide = 2 * half,
        h = h0 * scale,
        slant = l * scale,
        V = (aSide * aSide * h) / 3;
      if (!Number.isInteger(V)) return null;
      if (a.difficulty === 3) {
        return {
          statement: `Основание пирамиды — квадрат со стороной ${aSide}, высота пирамиды ${h}. Найдите объём.`,
          answer: numberAnswer(V),
          steps: [
            `Площадь основания ${aSide * aSide}.`,
            `V=Sосн·h/3=${aSide * aSide}·${h}/3=${V}.`,
          ],
          hints: ['Объём пирамиды равен трети произведения площади основания на высоту.'],
          taskType: 'geometry',
          figure: { kind: 'square_pyramid', a: aSide, h },
          parameters: { aSide, h },
        };
      }
      if (a.difficulty === 4) {
        return {
          statement: `Объём правильной четырёхугольной пирамиды равен ${V}, сторона основания ${aSide}. Найдите высоту.`,
          answer: numberAnswer(h),
          steps: [`Sосн=${aSide * aSide}.`, `h=3V/Sосн=3·${V}/${aSide * aSide}=${h}.`],
          hints: ['Выразите высоту из формулы объёма.'],
          taskType: 'geometry',
          figure: { kind: 'square_pyramid', a: aSide, h },
          parameters: { aSide, h, V },
        };
      }
      return {
        statement: `В правильной четырёхугольной пирамиде сторона основания равна ${aSide}, апофема боковой грани — ${slant}. Найдите объём пирамиды.`,
        answer: numberAnswer(V),
        steps: [
          `Расстояние от центра основания до середины стороны равно ${half}.`,
          `Высота пирамиды h=√(${slant}²-${half}²)=${h}.`,
          `V=${aSide * aSide}·${h}/3=${V}.`,
        ],
        hints: ['Апофема, высота и половина стороны основания образуют прямоугольный треугольник.'],
        taskType: 'geometry',
        figure: { kind: 'square_pyramid', a: aSide, h },
        parameters: { aSide, h, slant },
      };
    }
    case 'vectors': {
      const ax = rng.int(-8, 8),
        ay = rng.int(-8, 8),
        bx = rng.int(-8, 8),
        by = rng.int(-8, 8);
      if ((ax === 0 && ay === 0) || (bx === 0 && by === 0)) return null;
      if (a.difficulty === 3) {
        const dot = ax * bx + ay * by;
        return {
          statement: `Даны векторы a=(${ax};${ay}) и b=(${bx};${by}). Найдите их скалярное произведение.`,
          answer: numberAnswer(dot),
          steps: [`a·b=${ax}·${bx}+${ay}·${by}=${dot}.`],
          hints: ['Перемножьте соответствующие координаты и сложите.'],
          taskType: 'calculation',
          parameters: { ax, ay, bx, by },
        };
      }
      if (ay === 0) return null;
      const t = -(ax * bx) / ay;
      if (!Number.isInteger(t)) return null;
      if (a.difficulty === 4) {
        return {
          statement: `При каком t векторы a=(${ax};${ay}) и b=(${bx};t) перпендикулярны?`,
          answer: numberAnswer(t),
          steps: [
            `Для перпендикулярных векторов скалярное произведение равно нулю.`,
            `${ax}·${bx}+${ay}t=0.`,
            `t=${t}.`,
          ],
          hints: ['Приравняйте скалярное произведение к нулю.'],
          taskType: 'calculation',
          parameters: { ax, ay, bx, t },
        };
      }
      const cx = rng.int(-6, 6),
        cy = rng.int(-6, 6);
      const denom = ax * cx + ay * cy;
      if (denom === 0) return null;
      const num = -(ax * ax + ay * ay);
      if (num % denom !== 0) return null;
      const k = num / denom;
      return {
        statement: `Найдите t, при котором вектор a+t·c перпендикулярен a, если a=(${ax};${ay}), c=(${cx};${cy}).`,
        answer: numberAnswer(k),
        steps: [`Условие: (a+tc)·a=0.`, `a·a+t(c·a)=0.`, `Подстановка координат даёт t=${k}.`],
        hints: ['Раскройте скалярное произведение по линейности.'],
        taskType: 'calculation',
        parameters: { ax, ay, cx, cy, k },
      };
    }
    case 'probability_combinatorial': {
      const R = rng.int(4, 30),
        B = rng.int(4, 30),
        N = R + B;
      if (a.difficulty === 3) {
        return {
          statement: `В коробке ${R} красных и ${B} синих шаров. Наугад без возвращения достают два шара. Найдите вероятность того, что оба окажутся красными.`,
          answer: fracAnswer(R * (R - 1), N * (N - 1)),
          steps: [
            `Вероятность первого красного ${R}/${N}.`,
            `После этого вероятность второго красного ${R - 1}/${N - 1}.`,
            `Перемножаем вероятности.`,
          ],
          hints: ['После первого выбора состав коробки меняется.'],
          taskType: 'probability',
          parameters: { R, B },
        };
      }
      if (a.difficulty === 4) {
        return {
          statement: `В коробке ${R} красных и ${B} синих шаров. Два шара достают без возвращения. Найдите вероятность получить шары разных цветов.`,
          answer: fracAnswer(2 * R * B, N * (N - 1)),
          steps: [
            `Возможны два порядка: красный-синий и синий-красный.`,
            `Их суммарная вероятность равна 2·${R}·${B}/(${N}·${N - 1}).`,
            `Сокращаем дробь.`,
          ],
          hints: ['Учтите два возможных порядка цветов.'],
          taskType: 'probability',
          parameters: { R, B },
        };
      }
      if (R < 2 || B < 1) return null;
      const num = choose(R, 2) * B,
        den = choose(N, 3);
      return {
        statement: `В коробке ${R} красных и ${B} синих шаров. Одновременно выбирают три шара. Найдите вероятность того, что ровно два из них красные.`,
        answer: fracAnswer(num, den),
        steps: [
          `Всего способов выбрать три шара: C(${N},3)=${den}.`,
          `Благоприятных способов: C(${R},2)·C(${B},1)=${num}.`,
          `Вероятность равна отношению этих чисел.`,
        ],
        hints: ['Используйте сочетания для выбора без учёта порядка.'],
        taskType: 'probability',
        parameters: { R, B },
      };
    }
    case 'derivative_extremum': {
      if (a.difficulty === 3) {
        const xv = rng.int(-8, 8),
          A = rng.int(1, 6),
          min = rng.int(-20, 20);
        const B = -2 * A * xv,
          C = min + A * xv * xv;
        return {
          statement: `Найдите наименьшее значение функции f(x)=${A}x²${fmtSigned(B)}x${fmtSigned(C)}.`,
          answer: numberAnswer(min),
          steps: [
            `f'(x)=${2 * A}x${fmtSigned(B)}.`,
            `Критическая точка x=${xv}. Так как коэффициент при x² положительный, это минимум.`,
            `f(${xv})=${min}.`,
          ],
          hints: ['Найдите ноль производной.'],
          taskType: 'function',
          parameters: { xv, A, B, C, min },
        };
      }
      const r = rng.int(1, 6),
        C = rng.int(-15, 15);
      const f = (x: number) => x ** 3 - 3 * r * r * x + C;
      if (a.difficulty === 4) {
        const val = f(-r);
        return {
          statement: `Для функции f(x)=x³-${3 * r * r}x${fmtSigned(C)} найдите значение функции в точке локального максимума.`,
          answer: numberAnswer(val),
          steps: [
            `f'(x)=3x²-${3 * r * r}=3(x-${r})(x+${r}).`,
            `Критические точки ±${r}; при x=-${r} производная меняет знак с + на -, это максимум.`,
            `f(-${r})=${val}.`,
          ],
          hints: ['Исследуйте знак производной около критических точек.'],
          taskType: 'function',
          parameters: { r, C, val },
        };
      }
      const left = -r - 1,
        right = r + 1,
        candidates = [left, -r, r, right],
        values = candidates.map(f),
        max = Math.max(...values);
      return {
        statement: `Найдите наибольшее значение функции f(x)=x³-${3 * r * r}x${fmtSigned(C)} на отрезке [${left};${right}].`,
        answer: numberAnswer(max),
        steps: [
          `f'(x)=3(x-${r})(x+${r}); внутри отрезка критические точки -${r} и ${r}.`,
          `Сравниваем значения f в концах отрезка и критических точках.`,
          `Максимальное из ${values.join(', ')} равно ${max}.`,
        ],
        hints: ['На отрезке проверяются критические точки и оба конца.'],
        taskType: 'function',
        parameters: { r, C, left, right, values },
      };
    }
    case 'tangent_parameter': {
      const x0 = rng.int(-6, 6),
        m = rng.int(-15, 15),
        A = m - 2 * x0,
        C = rng.int(-10, 10);
      if (a.difficulty <= 4) {
        return {
          statement: `К графику f(x)=x²+ax${fmtSigned(C)} в точке с абсциссой ${x0} проведена касательная с угловым коэффициентом ${m}. Найдите a.`,
          answer: numberAnswer(A),
          steps: [`f'(x)=2x+a.`, `В точке x=${x0}: 2·${x0}+a=${m}.`, `a=${A}.`],
          hints: ['Угловой коэффициент касательной равен значению производной.'],
          taskType: 'function',
          parameters: { x0, m, A, C },
        };
      }
      const a2 = rng.int(-6, 6),
        b = m - (3 * x0 * x0 + 2 * a2 * x0);
      return {
        statement: `Для функции f(x)=x³${fmtSigned(a2)}x²+bx касательная в точке x=${x0} имеет угловой коэффициент ${m}. Найдите b.`,
        answer: numberAnswer(b),
        steps: [
          `f'(x)=3x²${fmtSigned(2 * a2)}x+b.`,
          `Подставляем x=${x0} и приравниваем производную к ${m}.`,
          `Получаем b=${b}.`,
        ],
        hints: ['Запишите производную и используйте заданный наклон касательной.'],
        taskType: 'function',
        parameters: { x0, m, a2, b },
      };
    }
    case 'finance_growth': {
      const rates = [5, 10, 20, 25, 50] as const,
        r1 = rng.pick(rates),
        r2 = rng.pick(rates),
        baseUnit = 10000,
        initial = baseUnit * rng.int(2, 40);
      const final = (initial * (100 + r1) * (100 + r2)) / 10000;
      if (!Number.isInteger(final)) return null;
      if (a.difficulty === 3) {
        return {
          statement: `Стоимость актива была ${initial} ₽. За первый период она выросла на ${r1}%, за второй — ещё на ${r2}%. Какой стала стоимость?`,
          answer: numberAnswer(final),
          steps: [
            `После первого роста: ${initial}·${100 + r1}/100.`,
            `После второго: умножаем ещё на ${100 + r2}/100.`,
            `Получаем ${final} ₽.`,
          ],
          hints: ['Последовательные проценты перемножаются коэффициентами.'],
          taskType: 'applied',
          parameters: { initial, r1, r2, final },
        };
      }
      if (a.difficulty === 4) {
        return {
          statement: `После увеличения на ${r1}% и затем ещё на ${r2}% сумма стала равна ${final} ₽. Найдите исходную сумму.`,
          answer: numberAnswer(initial),
          steps: [
            `Общий коэффициент изменения: (${100 + r1}/100)·(${100 + r2}/100).`,
            `Исходная сумма равна ${final}, делённому на этот коэффициент.`,
            `Получаем ${initial} ₽.`,
          ],
          hints: ['Выполните обратный расчёт через коэффициенты роста.'],
          taskType: 'applied',
          parameters: { initial, r1, r2, final },
        };
      }
      const rate = rng.pick([10, 20, 25, 50] as const),
        initial2 = 10000 * rng.int(2, 30),
        final2 = (initial2 * (100 + rate) ** 2) / 10000;
      if (!Number.isInteger(final2)) return null;
      return {
        statement: `Сумма ${initial2} ₽ два года подряд увеличивалась на один и тот же процент. После двух увеличений она стала ${final2} ₽. На сколько процентов увеличивали сумму каждый год?`,
        answer: numberAnswer(rate),
        steps: [
          `Пусть коэффициент ежегодного роста k. Тогда ${initial2}·k²=${final2}.`,
          `k=√(${final2}/${initial2})=${(100 + rate) / 100}.`,
          `Процент роста равен ${rate}%.`,
        ],
        hints: ['Два одинаковых процентных изменения дают квадрат коэффициента.'],
        taskType: 'applied',
        parameters: { initial2, final2, rate },
      };
    }
    case 'number_theory': {
      if (a.difficulty === 3) {
        const x = rng.int(12, 120),
          y = rng.int(12, 120),
          g = gcd(x, y),
          L = lcm(x, y);
        return {
          statement: `Найдите НОК чисел ${x} и ${y}, если сначала вычислите их НОД.`,
          answer: numberAnswer(L),
          steps: [`НОД(${x},${y})=${g}.`, `НОК·НОД=${x}·${y}.`, `НОК=${x * y}/${g}=${L}.`],
          hints: ['Используйте связь НОД и НОК двух чисел.'],
          taskType: 'short_answer',
          parameters: { x, y, g, L },
        };
      }
      const m = rng.pick([5, 7, 8, 9, 11]),
        r = rng.int(1, m - 1),
        k = rng.int(5, 40),
        ans = m * k + r,
        lower = ans - m + rng.int(1, m - 1);
      if (a.difficulty === 4) {
        return {
          statement: `Найдите наименьшее число больше ${lower}, которое при делении на ${m} даёт остаток ${r}.`,
          answer: numberAnswer(ans),
          steps: [
            `Такие числа имеют вид ${m}n+${r}.`,
            `Первое такое число после ${lower} — ${ans}.`,
          ],
          hints: ['Перебирайте числа вида mn+r.'],
          taskType: 'short_answer',
          parameters: { m, r, lower, ans },
        };
      }
      const d1 = rng.pick([3, 4, 5, 7]),
        d2 = rng.pick([5, 7, 8, 9]);
      if (gcd(d1, d2) !== 1) return null;
      const L = lcm(d1, d2),
        base = rng.int(1, L - 1),
        a1 = base % d1,
        a2 = base % d2,
        k2 = rng.int(3, 20),
        ans2 = base + k2 * L,
        lower2 = ans2 - L + rng.int(1, L - 1);
      return {
        statement: `Найдите наименьшее натуральное число больше ${lower2}, которое даёт остаток ${a1} при делении на ${d1} и остаток ${a2} при делении на ${d2}.`,
        answer: numberAnswer(ans2),
        steps: [
          `Общий период условий равен НОК(${d1},${d2})=${L}.`,
          `Число ${ans2} удовлетворяет обоим условиям.`,
          `Предыдущее решение ${ans2 - L} не больше ${lower2}, значит ${ans2} — минимальное подходящее.`,
        ],
        hints: ['Совместите два условия на остатки и используйте период НОК.'],
        taskType: 'short_answer',
        parameters: { d1, d2, a1, a2, L, lower2, ans2 },
      };
    }
    case 'integral_area': {
      if (a.difficulty === 3) {
        const m = rng.int(1, 8),
          b = rng.int(0, 10),
          n = rng.int(2, 10);
        const num = m * n * n + 2 * b * n;
        return {
          statement: `Вычислите $\\int_0^{${n}} (${m}x${fmtSigned(b)})\\,dx$.`,
          answer: fracAnswer(num, 2),
          steps: [
            `Первообразная: ${m}/2·x²${fmtSigned(b)}x.`,
            `Подставляем пределы 0 и ${n}.`,
            `Получаем ${num}/2.`,
          ],
          hints: ['Найдите первообразную линейной функции.'],
          taskType: 'calculation',
          parameters: { m, b, n },
        };
      }
      if (a.difficulty === 4) {
        const n = rng.int(2, 8),
          p = rng.int(-5, 5),
          q = rng.int(-5, 5);
        const num = 2 * n ** 3 + 3 * p * n * n + 6 * q * n;
        return {
          statement: `Вычислите $\\int_0^{${n}} (x^2${fmtSigned(p)}x${fmtSigned(q)})\\,dx$.`,
          answer: fracAnswer(num, 6),
          steps: [
            `Первообразная: x³/3${fmtSigned(p)}/2·x²${fmtSigned(q)}x.`,
            `Подставляем 0 и ${n}.`,
            `После приведения к общему знаменателю получаем ${num}/6.`,
          ],
          hints: ['Интегрируйте каждое слагаемое отдельно.'],
          taskType: 'calculation',
          parameters: { n, p, q },
        };
      }
      const left = rng.int(-4, 3),
        width = rng.int(2, 8),
        right = left + width,
        k = rng.int(1, 5),
        num = k * width ** 3;
      return {
        statement: `Графики y=0 и y=${k}(x-${left})(${right}-x) ограничивают фигуру на отрезке [${left};${right}]. Найдите её площадь.`,
        answer: fracAnswer(num, 6),
        steps: [
          `На данном отрезке функция неотрицательна, поэтому площадь равна определённому интегралу.`,
          `После замены t=x-${left} интегрируем ${k}t(${width}-t) от 0 до ${width}.`,
          `Площадь равна ${k}·${width}³/6=${num}/6.`,
        ],
        hints: ['На всём отрезке подынтегральная функция неотрицательна.'],
        taskType: 'function',
        parameters: { left, right, width, k },
      };
    }
    case 'mixed_parameter': {
      if (a.difficulty === 3) {
        const r = rng.int(-30, 30),
          lead = rng.int(1, 18),
          m = -2 * lead * r,
          q = lead * r * r;
        return {
          statement: `Найдите m, если уравнение ${lead}x²+mx${fmtSigned(q)}=0 имеет двойной корень x=${r}.`,
          answer: numberAnswer(m),
          steps: [
            `При двойном корне x=${r} многочлен равен ${lead}(x-${r})².`,
            `Коэффициент при x равен -2·${lead}·${r}.`,
            `Следовательно, m=${m}.`,
          ],
          hints: ['Представьте квадратный трёхчлен как a(x-r)².'],
          taskType: 'equation',
          parameters: { r, lead, q, m },
        };
      }
      let r1 = rng.int(1, 10),
        r2 = rng.int(1, 10);
      if (r1 === r2) r2 += 2;
      const S = r1 + r2,
        P = r1 * r2,
        shift = rng.int(-5, 5),
        m = S - shift;
      if (a.difficulty === 4) {
        return {
          statement: `Уравнение x²-(m${fmtSigned(shift)})x+${P}=0 имеет два положительных корня с суммой ${S}. Найдите m.`,
          answer: numberAnswer(m),
          steps: [
            `По Виету сумма корней равна m${fmtSigned(shift)}.`,
            `m${fmtSigned(shift)}=${S}.`,
            `m=${m}.`,
          ],
          hints: ['Сравните коэффициент при x с суммой корней.'],
          taskType: 'equation',
          parameters: { r1, r2, S, P, shift, m },
        };
      }
      const diff = Math.abs(r1 - r2);
      return {
        statement: `Квадратное уравнение x²-(m${fmtSigned(shift)})x+${P}=0 имеет два положительных корня, отличающихся на ${diff}. Найдите m.`,
        answer: numberAnswer(m),
        steps: [
          `Пусть корни отличаются на ${diff}, а их произведение ${P}. Для построенных целых корней это ${Math.min(r1, r2)} и ${Math.max(r1, r2)}.`,
          `Их сумма ${S}.`,
          `По Виету m${fmtSigned(shift)}=${S}, поэтому m=${m}.`,
        ],
        hints: ['Используйте одновременно произведение, разность и сумму корней.'],
        taskType: 'equation',
        parameters: { r1, r2, S, P, diff, shift, m },
      };
    }
    default:
      return null;
  }
}

// Fix the one branch that needs a deterministic scaled triangle without abusing arguments.
function generateTrigTriangleDifficulty4(a: HistoricalArchetype, rng: SeededRandom): GeneratedCore {
  const [u, vv, w] = rng.pick(triples),
    swap = rng.next() < 0.5,
    aLeg = swap ? vv : u,
    bLeg = swap ? u : vv,
    scale = rng.int(2, 32),
    hyp = w * scale,
    adj = bLeg * scale;
  return {
    statement: `В прямоугольном треугольнике sin α=$\\frac{${aLeg}}{${w}}$, а гипотенуза равна ${hyp} см. Найдите прилежащий к α катет.`,
    answer: numberAnswer(adj),
    steps: [
      `Из sin α=${aLeg}/${w} получаем отношение катетов и гипотенузы, соответствующее тройке ${aLeg}:${bLeg}:${w}.`,
      `Коэффициент масштаба ${hyp}:${w}=${scale}.`,
      `Прилежащий катет равен ${bLeg}·${scale}=${adj} см.`,
    ],
    hints: ['Восстановите отношение сторон прямоугольного треугольника.'],
    taskType: 'geometry',
    parameters: { aLeg, bLeg, w, scale, hyp, adj },
  };
}

const all = readGzip<MathTaskLike[]>(SOURCE);
const baseTasks = all.filter((task) => task.source?.origin !== ORIGIN);
const existingIds = new Set(baseTasks.map((task) => task.id));
const fingerprints = new Set(baseTasks.map((task) => task.fingerprint));
if (
  baseTasks.some(
    (task) =>
      /^math-ru-0?(9\d{3}|1\d{4}|2\d{4})$/.test(task.id) &&
      Number(task.id.split('-').at(-1)) > 9000,
  )
) {
  throw new Error(
    'Found non-historical numeric task IDs above 9000; refuse to reuse reserved historical range.',
  );
}

const byGrade = new Map<number, HistoricalArchetype[]>();
for (const a of historicalArchetypes) {
  const list = byGrade.get(a.grade) ?? [];
  list.push(a);
  byGrade.set(a.grade, list);
}

const generated: MathTaskLike[] = [];
let nextId = 9001;
const archetypeStats: Record<string, number> = {};

for (const grade of [5, 6, 7, 8, 9, 10, 11]) {
  const archetypes = byGrade.get(grade) ?? [];
  const target = TARGET_BY_GRADE[grade]!;
  const baseCount = Math.floor(target / archetypes.length);
  const remainder = target % archetypes.length;
  for (let ai = 0; ai < archetypes.length; ai += 1) {
    const archetype = archetypes[ai]!;
    const need = baseCount + (ai < remainder ? 1 : 0);
    let accepted = 0,
      attempt = 0;
    const rng = new SeededRandom(SEED + grade * 100000 + ai * 1009);
    while (accepted < need && attempt < need * 400) {
      attempt += 1;
      const generatedCore = generateCore(archetype, rng, attempt);
      if (!generatedCore) continue;
      const core = tidyGeneratedCore(generatedCore);
      const fp = fingerprint(core.statement);
      if (fingerprints.has(fp)) continue;
      const id = `math-ru-${String(nextId).padStart(5, '0')}`;
      if (existingIds.has(id)) throw new Error(`ID collision: ${id}`);
      const task = createTask(archetype, core, id, SEED + nextId);
      fingerprints.add(fp);
      existingIds.add(id);
      generated.push(task);
      nextId += 1;
      accepted += 1;
    }
    if (accepted !== need)
      throw new Error(`${archetype.id}: generated ${accepted}/${need} after ${attempt} attempts`);
    archetypeStats[archetype.id] = accepted;
  }
}

const result = [...baseTasks, ...generated];
writeGzip(SOURCE, result);
writeGzip(PROVENANCE, {
  version: CONTENT_VERSION,
  methodology: 'historical_archetype_only',
  copiedTaskTexts: false,
  generatedTasks: generated.length,
  baseTasksPreserved: baseTasks.length,
  legalNote:
    'Исторические произведения используются как источник математических архетипов. Формулировки, числа, решения и комбинации параметров созданы заново. Поздние редакторские добавления советских переизданий намеренно не используются.',
  sources,
  archetypes: Object.fromEntries(
    historicalArchetypes.map((a) => [
      a.id,
      {
        sourceKey: a.sourceKey,
        grade: a.grade,
        difficulty: a.difficulty,
        topicId: a.topicId,
        groupId: a.groupId,
        generatedCount: archetypeStats[a.id] ?? 0,
      },
    ]),
  ),
});

console.log(
  JSON.stringify(
    {
      base: baseTasks.length,
      added: generated.length,
      total: result.length,
      archetypes: historicalArchetypes.length,
      byGrade: Object.fromEntries(
        [5, 6, 7, 8, 9, 10, 11].map((g) => [g, generated.filter((t) => t.grade === g).length]),
      ),
      byDifficulty: Object.fromEntries(
        [3, 4, 5].map((d) => [d, generated.filter((t) => t.difficulty === d).length]),
      ),
    },
    null,
    2,
  ),
);
