import { BANK_BASE_URL, MATH_BANK_BASE_URL, type BankSubject } from '../model/constants';
import type { PhysicsSearchDocument, PhysicsTask } from '../model/physics';
import type { RussianTask } from '../model/russian';
import type {
  MathBankCatalogItem,
  MathBankExamIndexItem,
  MathGrade,
  MathTask,
} from '../model/schema';
import { readGzipJson, readJson } from './fetchJson';
import {
  clearPhysicsBankCache,
  loadPhysicsGrade,
  loadPhysicsManifest,
  loadPhysicsTask,
} from './physics';
import {
  adaptPhysicsSearchDocument,
  physicsTaskToSearchDocument,
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

const searchDocumentCache = new Map<BankSubject, Promise<MathTaskSearchDocument[]>>();

const rememberSearchDocuments = (
  subject: BankSubject,
  request: Promise<MathTaskSearchDocument[]>,
) => {
  searchDocumentCache.set(subject, request);
  request.catch(() => {
    if (searchDocumentCache.get(subject) === request) {
      searchDocumentCache.delete(subject);
    }
  });
  return request;
};

export const loadMathSearchDocuments = (baseUrl = MATH_BANK_BASE_URL) => {
  const cached = searchDocumentCache.get('mathematics');
  if (cached && baseUrl === MATH_BANK_BASE_URL) {
    return cached;
  }

  const request = readGzipJson<MathTaskSearchDocument[]>(
    `${baseUrl}/search_documents.json.gz`,
  ).then((documents) =>
    documents.map((document) => ({
      ...document,
      subject: document.subject ?? ('mathematics' as const),
    })),
  );

  if (baseUrl === MATH_BANK_BASE_URL) {
    return rememberSearchDocuments('mathematics', request);
  }

  return request;
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

export const examIndexFromSearchDocuments = (
  documents: MathTaskSearchDocument[],
): MathBankExamIndexItem[] => {
  const counts = new Map<string, MathBankExamIndexItem>();

  for (const document of documents) {
    for (const mapping of document.examMappings) {
      if (mapping.year !== 2026) {
        continue;
      }

      for (const taskNumber of mapping.taskNumbers) {
        const key = `${mapping.exam}:${taskNumber}`;
        const current = counts.get(key) ?? {
          exam: mapping.exam,
          year: mapping.year,
          taskNumber,
          count: 0,
        };
        current.count += 1;
        counts.set(key, current);
      }
    }
  }

  return [...counts.values()].sort(
    (a, b) => a.exam.localeCompare(b.exam) || a.taskNumber - b.taskNumber,
  );
};

export const loadBankSearchDocuments = (subject: BankSubject) => {
  const cached = searchDocumentCache.get(subject);
  if (cached) {
    return cached;
  }

  if (subject === 'mathematics') {
    return loadMathSearchDocuments();
  }

  if (subject === 'physics') {
    const request = loadPhysicsManifest().then(async (manifest) => {
      const documents = await readGzipJson<PhysicsSearchDocument[]>(
        `${BANK_BASE_URL.physics}/${manifest.search}`,
      );
      return documents.map(adaptPhysicsSearchDocument);
    });
    return rememberSearchDocuments('physics', request);
  }

  const request = readGzipJson<RussianSearchDocument[]>(
    `${BANK_BASE_URL.russian}/search_documents.json.gz`,
  ).then((documents) => documents.map(adaptRussianSearchDocument));
  return rememberSearchDocuments('russian', request);
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

export const loadBankExamIndex = async (
  subject: BankSubject,
  documents?: MathTaskSearchDocument[],
) => {
  if (subject === 'mathematics') {
    return loadMathExamIndex();
  }

  if (subject === 'physics') {
    return examIndexFromSearchDocuments(documents ?? (await loadBankSearchDocuments('physics')));
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

  if (subject === 'russian') {
    return loadRussianGrade(grade);
  }

  return loadPhysicsGrade(grade);
};

export const loadBankTaskById = async (subject: BankSubject, id: string, grade: MathGrade) => {
  if (subject === 'mathematics') {
    return loadMathTaskById(id, grade);
  }

  if (subject === 'physics') {
    return loadPhysicsTask(id);
  }

  const tasks = await loadRussianGrade(grade);
  return tasks.find((task) => task.id === id) ?? null;
};

type BankTask = MathTask | RussianTask | PhysicsTask;

export const getBankTaskStatement = (task: BankTask | MathTaskSearchDocument) => {
  if (typeof task.statement === 'string') {
    return task.statement;
  }

  return task.statement.text;
};

export const toBankSearchDocument = (task: BankTask): MathTaskSearchDocument => {
  if (task.subject === 'russian') {
    return russianTaskToSearchDocument(task);
  }

  if (task.subject === 'physics') {
    return physicsTaskToSearchDocument(task);
  }

  return taskToSearchDocument(task);
};

export const getBankVariantGroupId = (task: BankTask) =>
  task.subject === 'physics' ? task.variantGroup : task.generator.variantGroupId;

export const loadNextBankVariant = async (
  task: BankTask,
): Promise<MathTaskSearchDocument | null> => {
  if (task.subject === 'physics') {
    const documents = await loadBankSearchDocuments('physics');
    const variants = documents.filter(
      (item) => item.variantGroup === task.variantGroup && item.id !== task.id,
    );
    return variants[Math.floor(Math.random() * variants.length)] ?? null;
  }

  const gradeTasks = await loadBankGrade(task.subject, task.grade);
  const variantGroupId = getBankVariantGroupId(task);
  const variants = gradeTasks.filter(
    (item) => getBankVariantGroupId(item) === variantGroupId && item.id !== task.id,
  );
  const next = variants[Math.floor(Math.random() * variants.length)];
  return next ? toBankSearchDocument(next) : null;
};

export const clearMathBankCache = () => {
  mathGradeCache.clear();
  russianGradeCache.clear();
  searchDocumentCache.clear();
  clearPhysicsBankCache();
};
