import MiniSearch from 'minisearch';
import type { ExamKind, MathTask, MathTaskExamMapping, MathTaskType } from '../model/schema';
import { normalizeSearchText } from './normalize';

export type SearchFilters = {
  grades?: number[];
  topicIds?: string[];
  topics?: string[];
  difficulty?: number[];
  taskTypes?: MathTaskType[];
  exam?: ExamKind;
  examYear?: number;
  examTaskNumbers?: number[];
  favoriteIds?: string[];
};

/** Lightweight object shipped in search_documents.json.gz. */
export type MathTaskSearchDocument = {
  id: string;
  statement: string;
  grade: number;
  difficulty: number;
  topicId: string;
  topic: string;
  subtopic: string;
  taskType?: MathTaskType;
  skills: string[];
  tags: string[];
  aliases: string[];
  examMappings: MathTaskExamMapping[];
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

  const search = (query: string, filters: SearchFilters = {}, limit = 200) => {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) {
      return documents.filter((task) => matchesFilters(task, filters)).slice(0, limit);
    }

    return index
      .search(normalizedQuery)
      .map((result) => documentById.get(String(result.id)))
      .filter((task): task is MathTaskSearchDocument => Boolean(task))
      .filter((task) => matchesFilters(task, filters))
      .slice(0, limit);
  };

  return { search, index };
};

export type MathTaskSearch = ReturnType<typeof createMathTaskSearch>;
