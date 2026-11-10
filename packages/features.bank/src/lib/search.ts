import MiniSearch from 'minisearch';
import type { BankSubject } from '../model/constants';
import type { EnglishSearchDocument, EnglishTask } from '../model/english';
import type { PhysicsSearchDocument, PhysicsTask } from '../model/physics';
import type { ExamKind, MathTask, MathTaskExamMapping } from '../model/schema';
import type { RussianTask } from '../model/russian';
import { normalizeSearchText } from './normalize';

export type SearchFilters = {
  grades?: number[];
  topicIds?: string[];
  topics?: string[];
  difficulty?: number[];
  taskTypes?: string[];
  exam?: ExamKind;
  examYear?: number;
  examTaskNumbers?: number[];
  favoriteIds?: string[];
};

/** Lightweight object shipped in search_documents.json.gz. */
export type MathTaskSearchDocument = {
  id: string;
  subject?: BankSubject;
  statement: string;
  grade: number;
  difficulty: number;
  topicId: string;
  topic: string;
  subtopic: string;
  taskType?: string;
  skills: string[];
  tags: string[];
  aliases: string[];
  examMappings: MathTaskExamMapping[];
  variantGroup?: string;
};

type IndexedDocument = {
  id: string;
  statement: string;
  topic: string;
  subtopic: string;
  skills: string;
  tags: string;
  aliases: string;
  examTerms: string;
  grade: number;
  difficulty: number;
  topicId: string;
};

export const taskToSearchDocument = (task: MathTask): MathTaskSearchDocument => ({
  id: task.id,
  subject: 'mathematics',
  statement: task.statement.text,
  grade: task.grade,
  difficulty: task.difficulty,
  topicId: task.topicId,
  topic: task.topic,
  subtopic: task.subtopic,
  taskType: task.taskType,
  skills: task.skills,
  tags: task.tags,
  aliases: task.search.aliases,
  examMappings: task.examMappings,
});

export const russianTaskToSearchDocument = (task: RussianTask): MathTaskSearchDocument => ({
  id: task.id,
  subject: 'russian',
  statement: task.statement,
  grade: task.grade,
  difficulty: task.difficulty,
  topicId: task.topic,
  topic: task.topic,
  subtopic: task.subtopic,
  taskType: task.taskType,
  skills: task.skills,
  tags: task.tags,
  aliases: task.search.aliases,
  examMappings: task.examMappings,
});

const PHYSICS_EXAM_TERM = /^(oge|ege):(\d+):(\d+)$/;

export const physicsTopicLabel = (topic: string) => topic.replace(/-/g, ' ');

export const physicsSubtopicLabel = (topic: string, subtopic: string, aliases: string[]) =>
  aliases.find((alias) => alias !== topic) ?? subtopic;

export const examMappingsFromPhysicsTerms = (terms: string[]): MathTaskExamMapping[] => {
  const grouped = new Map<string, MathTaskExamMapping>();

  for (const term of terms) {
    const match = term.match(PHYSICS_EXAM_TERM);
    if (!match) {
      continue;
    }

    const exam = match[1] === 'oge' ? 'OGE' : 'EGE';
    const year = Number(match[2]);
    const taskNumber = Number(match[3]);
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

export const adaptPhysicsSearchDocument = (
  document: PhysicsSearchDocument,
): MathTaskSearchDocument => {
  const examMappings = examMappingsFromPhysicsTerms(document.examTerms);
  const examAliases = examMappings.flatMap((mapping) =>
    mapping.taskNumbers.map((number) => `${mapping.exam === 'OGE' ? 'ОГЭ' : 'ЕГЭ'} ${number}`),
  );
  return {
    id: document.id,
    subject: 'physics',
    statement: document.statementPreview,
    grade: document.grade,
    difficulty: document.difficulty,
    topicId: document.topic,
    topic: physicsTopicLabel(document.topic),
    subtopic: physicsSubtopicLabel(document.topic, document.subtopic, document.aliases),
    taskType: document.taskType,
    skills: document.skills,
    tags: document.tags,
    aliases: [...document.aliases, ...examAliases],
    examMappings,
    variantGroup: document.variantGroup,
  };
};

const ENGLISH_TOPIC_LABELS: Record<string, string> = {
  grammar: 'Грамматика',
  reading: 'Чтение',
  vocabulary: 'Лексика',
  'word-formation': 'Словообразование',
  writing: 'Письмо',
};

const ENGLISH_EXAM_TERM = /^(oge|ege)\s+(\d+)$/i;

export const englishTopicLabel = (topic: string) =>
  ENGLISH_TOPIC_LABELS[topic] ?? topic.replace(/-/g, ' ');

export const englishSubtopicLabel = (subtopic: string) => subtopic.replace(/-/g, ' ');

export const examMappingsFromEnglishTerms = (terms: string[]): MathTaskExamMapping[] => {
  const grouped = new Map<string, MathTaskExamMapping>();

  for (const term of terms) {
    const match = term.match(ENGLISH_EXAM_TERM);
    if (!match) {
      continue;
    }

    const exam = match[1].toLowerCase() === 'oge' ? 'OGE' : 'EGE';
    const taskNumber = Number(match[2]);
    const key = `${exam}:2026`;
    const current = grouped.get(key) ?? {
      exam,
      year: 2026,
      taskNumbers: [],
      relation: 'foundation' as const,
    };

    if (!current.taskNumbers.includes(taskNumber)) {
      current.taskNumbers.push(taskNumber);
    }

    grouped.set(key, current);
  }

  return [...grouped.values()];
};

export const adaptEnglishSearchDocument = (
  document: EnglishSearchDocument,
): MathTaskSearchDocument => {
  const examMappings = examMappingsFromEnglishTerms(document.examTerms);
  const examAliases = examMappings.flatMap((mapping) =>
    mapping.taskNumbers.map((number) => `${mapping.exam === 'OGE' ? 'ОГЭ' : 'ЕГЭ'} ${number}`),
  );

  return {
    id: document.id,
    subject: 'english',
    statement: document.statementPreview,
    grade: document.grade,
    difficulty: document.difficulty,
    topicId: document.topic,
    topic: englishTopicLabel(document.topic),
    subtopic: englishSubtopicLabel(document.subtopic),
    taskType: document.taskType,
    skills: document.skills,
    tags: document.tags,
    aliases: [...document.aliases, ...examAliases],
    examMappings,
    variantGroup: document.variantGroup,
  };
};

export const englishTaskToSearchDocument = (task: EnglishTask): MathTaskSearchDocument => ({
  id: task.id,
  subject: 'english',
  statement: task.statement,
  grade: task.grade,
  difficulty: task.difficulty,
  topicId: task.topic,
  topic: englishTopicLabel(task.topic),
  subtopic: englishSubtopicLabel(task.subtopic),
  taskType: task.taskType,
  skills: task.skills,
  tags: task.tags,
  aliases: task.aliases,
  examMappings: task.examMappings.map((mapping) => ({
    exam: mapping.exam === 'oge' ? 'OGE' : 'EGE',
    year: mapping.year,
    taskNumbers: mapping.taskNumbers,
    relation: mapping.relation,
  })),
  variantGroup: task.variantGroup,
});

export const physicsTaskToSearchDocument = (task: PhysicsTask): MathTaskSearchDocument => ({
  id: task.id,
  subject: 'physics',
  statement: task.statement,
  grade: task.grade,
  difficulty: task.difficulty,
  topicId: task.topic,
  topic: physicsTopicLabel(task.topic),
  subtopic: physicsSubtopicLabel(task.topic, task.subtopic, task.aliases),
  taskType: task.taskType,
  skills: task.skills,
  tags: task.tags,
  aliases: task.aliases,
  examMappings: task.examMappings.map((mapping) => ({
    exam: mapping.exam === 'oge' ? 'OGE' : 'EGE',
    year: mapping.year,
    taskNumbers: mapping.taskNumbers,
    relation: mapping.relation,
  })),
  variantGroup: task.variantGroup,
});

const toIndexedDocument = (task: MathTaskSearchDocument): IndexedDocument => ({
  id: task.id,
  statement: normalizeSearchText(task.statement),
  topic: normalizeSearchText(task.topic),
  subtopic: normalizeSearchText(task.subtopic),
  skills: normalizeSearchText(task.skills.join(' ')),
  tags: normalizeSearchText(task.tags.join(' ')),
  aliases: normalizeSearchText(task.aliases.join(' ')),
  examTerms: normalizeSearchText(
    task.examMappings
      .flatMap((mapping) =>
        mapping.taskNumbers.flatMap((number) => [
          `${mapping.exam} ${mapping.year} задание ${number}`,
          `${mapping.exam} ${number}`,
        ]),
      )
      .join(' '),
  ),
  grade: task.grade,
  difficulty: task.difficulty,
  topicId: task.topicId,
});

const matchesFilters = (task: MathTaskSearchDocument, filters: SearchFilters) => {
  if (filters.grades?.length && !filters.grades.includes(task.grade)) {
    return false;
  }
  if (filters.topicIds?.length && !filters.topicIds.includes(task.topicId)) {
    return false;
  }
  if (filters.topics?.length && !filters.topics.includes(task.topic)) {
    return false;
  }
  if (filters.difficulty?.length && !filters.difficulty.includes(task.difficulty)) {
    return false;
  }
  if (filters.taskTypes?.length && (!task.taskType || !filters.taskTypes.includes(task.taskType))) {
    return false;
  }
  if (filters.favoriteIds && !filters.favoriteIds.includes(task.id)) {
    return false;
  }

  if (filters.exam) {
    const matchesExam = task.examMappings.some((mapping) => {
      if (mapping.exam !== filters.exam) {
        return false;
      }
      if (filters.examYear && mapping.year !== filters.examYear) {
        return false;
      }
      if (
        filters.examTaskNumbers?.length &&
        !mapping.taskNumbers.some((number) => filters.examTaskNumbers?.includes(number))
      ) {
        return false;
      }
      return true;
    });
    if (!matchesExam) {
      return false;
    }
  }

  return true;
};

export const createMathTaskSearch = (documents: MathTaskSearchDocument[]) => {
  const documentById = new Map(documents.map((document) => [document.id, document]));
  const index = new MiniSearch<IndexedDocument>({
    fields: ['statement', 'topic', 'subtopic', 'skills', 'tags', 'aliases', 'examTerms'],
    storeFields: ['grade', 'difficulty', 'topicId'],
    searchOptions: {
      prefix: true,
      fuzzy: 0.18,
      boost: {
        topic: 4,
        subtopic: 4,
        skills: 3,
        aliases: 3,
        examTerms: 3,
        tags: 2,
        statement: 1,
      },
    },
  });

  index.addAll(documents.map(toIndexedDocument));

  const takeDiverse = (tasks: MathTaskSearchDocument[], limit: number) => {
    const seenGroups = new Set<string>();
    const result: MathTaskSearchDocument[] = [];

    for (const task of tasks) {
      if (task.variantGroup) {
        if (seenGroups.has(task.variantGroup)) {
          continue;
        }
        seenGroups.add(task.variantGroup);
      }

      result.push(task);
      if (result.length >= limit) {
        break;
      }
    }

    return result;
  };

  const search = (query: string, filters: SearchFilters = {}, limit = 200) => {
    const normalizedQuery = normalizeSearchText(query);
    const matched = normalizedQuery
      ? index
          .search(normalizedQuery)
          .map((result) => documentById.get(String(result.id)))
          .filter((task): task is MathTaskSearchDocument => Boolean(task))
          .filter((task) => matchesFilters(task, filters))
      : documents.filter((task) => matchesFilters(task, filters));

    return takeDiverse(matched, limit);
  };

  return { search, index };
};

export type MathTaskSearch = ReturnType<typeof createMathTaskSearch>;
