import { MATH_BANK_BASE_URL } from '../model/constants';
import type {
  MathBankCatalogItem,
  MathBankExamIndexItem,
  MathGrade,
  MathTask,
} from '../model/schema';
import type { MathTaskSearchDocument } from './search';

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

export const loadMathSearchDocuments = (baseUrl = MATH_BANK_BASE_URL) =>
  readGzipJson<MathTaskSearchDocument[]>(`${baseUrl}/search_documents.json.gz`);

export const loadMathCatalog = (baseUrl = MATH_BANK_BASE_URL) =>
  readJson<MathBankCatalogItem[]>(`${baseUrl}/catalog.json`);

export const loadMathExamIndex = (baseUrl = MATH_BANK_BASE_URL) =>
  readJson<MathBankExamIndexItem[]>(`${baseUrl}/exam_index_2026.json`);

const gradeCache = new Map<MathGrade, Promise<MathTask[]>>();

export const loadMathGrade = (grade: MathGrade, baseUrl = MATH_BANK_BASE_URL) => {
  const cached = gradeCache.get(grade);
  if (cached) {
    return cached;
  }

  const request = readGzipJson<MathTask[]>(`${baseUrl}/by_grade/grade-${grade}.json.gz`);
  gradeCache.set(grade, request);
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

export const clearMathBankCache = () => gradeCache.clear();
