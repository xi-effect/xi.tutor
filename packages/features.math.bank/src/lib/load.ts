import { BANK_BASE_URL, MATH_BANK_BASE_URL, type BankSubject } from '../model/constants';
import type {
  MathBankCatalogItem,
  MathBankExamIndexItem,
  MathGrade,
  MathTask,
} from '../model/schema';
import type { RussianTask } from '../model/russian';
import {
  russianTaskToSearchDocument,
  taskToSearchDocument,
  type MathTaskSearchDocument,
} from './search';

type RussianSearchDocument = {
  id: string;
  subject: 'russian';
  grade: number;
  topic: string;
  subtopic: string;
  skills: string[];
  difficulty: number;
  taskType: string;
  statement: string;
  aliases: string[];
  tags: string[];
  examTerms: string[];
};

const readJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

const readGzipJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }

  // If CDN/server decoded Content-Encoding already, JSON can be read directly.
  if (response.headers.get('content-encoding')?.includes('gzip')) {
    return response.json() as Promise<T>;
  }

  if (!('DecompressionStream' in globalThis)) {
    throw new Error(
      'DecompressionStream is unavailable. Serve .gz with Content-Encoding: gzip or add a decoder fallback.',
    );
  }

  const body = response.body?.pipeThrough(new DecompressionStream('gzip'));
  if (!body) {
    throw new Error(`Empty response body for ${url}`);
  }

  return JSON.parse(await new Response(body).text()) as T;
};

const EXAM_TERM = /^(OGE|EGE)\s+(\d+)\s+(\d+)$/;

const examMappingsFromTerms = (terms: string[]): MathTaskSearchDocument['examMappings'] => {
  const grouped = new Map<string, MathTaskSearchDocument['examMappings'][number]>();

  for (const term of terms) {
    const match = term.match(EXAM_TERM);
    if (!match) {
      continue;
    }

    const exam = match[1] as 'OGE' | 'EGE';
    const taskNumber = Number(match[2]);
    const year = Number(match[3]);
    const key = `${exam}:${year}`;
    const current = grouped.get(key) ?? {
      exam,
      year,
      taskNumbers: [],
      relation: 'foundation',
    };

    if (!current.taskNumbers.includes(taskNumber)) {
      current.taskNumbers.push(taskNumber);
    }

    grouped.set(key, current);
  }

  return [...grouped.values()];
};

export const adaptRussianSearchDocument = (
  document: RussianSearchDocument,
): MathTaskSearchDocument => ({
  id: document.id,
  subject: 'russian',
  statement: document.statement,
  grade: document.grade,
  difficulty: document.difficulty,
  topicId: document.topic,
  topic: document.topic,
  subtopic: document.subtopic,
  taskType: document.taskType,
  skills: document.skills,
  tags: document.tags,
  aliases: document.aliases,
  examMappings: examMappingsFromTerms(document.examTerms),
});

export const catalogFromSearchDocuments = (
  documents: MathTaskSearchDocument[],
): MathBankCatalogItem[] => {
  const catalogMap = new Map<string, MathBankCatalogItem & { skillSet: Set<string> }>();

  for (const document of documents) {
    const key = `${document.grade}::${document.topicId}::${document.subtopic}`;
    const current = catalogMap.get(key) ?? {
      grade: document.grade,
      topicId: document.topicId,
      topic: document.topic,
      subtopic: document.subtopic,
      skills: [],
      count: 0,
      skillSet: new Set<string>(),
    };

    document.skills.forEach((skill) => current.skillSet.add(skill));
    current.count += 1;
    catalogMap.set(key, current);
  }

  return [...catalogMap.values()]
    .map(({ skillSet, ...item }) => ({
      ...item,
      skills: [...skillSet].sort((a, b) => a.localeCompare(b, 'ru')),
    }))
    .sort(
      (a, b) =>
        a.grade - b.grade ||
        a.topic.localeCompare(b.topic, 'ru') ||
        a.subtopic.localeCompare(b.subtopic, 'ru'),
    );
};

export const loadMathSearchDocuments = async (baseUrl = MATH_BANK_BASE_URL) => {
  const documents = await readGzipJson<MathTaskSearchDocument[]>(
    `${baseUrl}/search_documents.json.gz`,
  );
  return documents.map((document) => ({
    ...document,
    subject: document.subject ?? 'mathematics',
  }));
};

export const loadMathCatalog = (baseUrl = MATH_BANK_BASE_URL) =>
  readJson<MathBankCatalogItem[]>(`${baseUrl}/catalog.json`);

export const loadMathExamIndex = (baseUrl = MATH_BANK_BASE_URL) =>
  readJson<MathBankExamIndexItem[]>(`${baseUrl}/exam_index_2026.json`);

const mathGradeCache = new Map<MathGrade, Promise<MathTask[]>>();
const russianGradeCache = new Map<MathGrade, Promise<RussianTask[]>>();

export const loadMathGrade = (grade: MathGrade, baseUrl = MATH_BANK_BASE_URL) => {
  const cached = mathGradeCache.get(grade);
  if (cached) {
    return cached;
  }

  const request = readGzipJson<MathTask[]>(`${baseUrl}/by_grade/grade-${grade}.json.gz`);
  mathGradeCache.set(grade, request);
  return request;
};

export const loadMathTaskById = async (
  id: string,
  grade: MathGrade,
  baseUrl = MATH_BANK_BASE_URL,
) => {
  const tasks = await loadMathGrade(grade, baseUrl);
  return tasks.find((task) => task.id === id) ?? null;
};

export const loadBankSearchDocuments = async (subject: BankSubject) => {
  if (subject === 'mathematics') {
    return loadMathSearchDocuments();
  }

  const documents = await readGzipJson<RussianSearchDocument[]>(
    `${BANK_BASE_URL.russian}/search_documents.json.gz`,
  );
  return documents.map(adaptRussianSearchDocument);
};

export const loadBankCatalog = async (
  subject: BankSubject,
  documents?: MathTaskSearchDocument[],
) => {
  if (subject === 'mathematics') {
    return loadMathCatalog();
  }

  if (documents) {
    return catalogFromSearchDocuments(documents);
  }

  return catalogFromSearchDocuments(await loadBankSearchDocuments(subject));
};

export const loadBankExamIndex = async (subject: BankSubject) => {
  if (subject === 'mathematics') {
    return loadMathExamIndex();
  }

  const index = await readJson<Record<string, string[]>>(
    `${BANK_BASE_URL.russian}/exam_index_2026.json`,
  );

  return Object.entries(index)
    .map(([key, ids]) => {
      const [exam, year, taskNumber] = key.split(':');
      return {
        exam: exam as MathBankExamIndexItem['exam'],
        year: Number(year),
        taskNumber: Number(taskNumber),
        count: ids.length,
      };
    })
    .filter((item) => item.year === 2026 && Number.isFinite(item.taskNumber))
    .sort((a, b) => a.exam.localeCompare(b.exam) || a.taskNumber - b.taskNumber);
};

export const loadRussianGrade = (grade: MathGrade, baseUrl = BANK_BASE_URL.russian) => {
  const cached = russianGradeCache.get(grade);
  if (cached) {
    return cached;
  }

  const request = readGzipJson<RussianTask[]>(`${baseUrl}/by_grade/grade-${grade}.json.gz`);
  russianGradeCache.set(grade, request);
  return request;
};

export const loadBankGrade = (subject: BankSubject, grade: MathGrade) => {
  if (subject === 'mathematics') {
    return loadMathGrade(grade);
  }

  return loadRussianGrade(grade);
};

export const loadBankTaskById = async (subject: BankSubject, id: string, grade: MathGrade) => {
  if (subject === 'mathematics') {
    return loadMathTaskById(id, grade);
  }

  const tasks = await loadRussianGrade(grade);
  return tasks.find((task) => task.id === id) ?? null;
};

export const getBankTaskStatement = (task: MathTask | RussianTask | MathTaskSearchDocument) => {
  if (typeof task.statement === 'string') {
    return task.statement;
  }

  return task.statement.text;
};

export const toBankSearchDocument = (task: MathTask | RussianTask): MathTaskSearchDocument =>
  task.subject === 'russian' ? russianTaskToSearchDocument(task) : taskToSearchDocument(task);

export const getBankVariantGroupId = (task: MathTask | RussianTask) =>
  task.generator.variantGroupId;

export const clearMathBankCache = () => {
  mathGradeCache.clear();
  russianGradeCache.clear();
};
