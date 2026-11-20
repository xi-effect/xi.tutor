import { ENGLISH_BANK_BASE_URL } from '../model/constants';
import {
  englishManifestSchema,
  englishTaskArraySchema,
  type EnglishManifest,
  type EnglishTask,
} from '../model/english';
import { readGzipJson, readJson } from './fetchJson';

const SHARD_CACHE_LIMIT = 8;

let manifestPromise: Promise<EnglishManifest> | undefined;
let locatorPromise: Promise<Record<string, string>> | undefined;
const shardCache = new Map<string, Promise<EnglishTask[]>>();
const gradeCache = new Map<number, Promise<EnglishTask[]>>();

const englishUrl = (file: string, baseUrl = ENGLISH_BANK_BASE_URL) => {
  const base = baseUrl.replace(/\/$/, '');
  return `${base}/${file.replace(/^\/+/, '')}`;
};

const isSafeShardFile = (file: string) => /^grade-(?:5|6|7|8|9|10|11)-\d{3}\.json\.gz$/.test(file);

export const loadEnglishManifest = (baseUrl = ENGLISH_BANK_BASE_URL) => {
  manifestPromise ??= readJson<unknown>(englishUrl('manifest.json', baseUrl))
    .then((payload) => englishManifestSchema.parse(payload))
    .catch((error: unknown) => {
      manifestPromise = undefined;
      throw error;
    });
  return manifestPromise;
};

export const loadEnglishLocator = async (baseUrl = ENGLISH_BANK_BASE_URL) => {
  locatorPromise ??= (async () => {
    try {
      const manifest = await loadEnglishManifest(baseUrl);
      return await readGzipJson<Record<string, string>>(englishUrl(manifest.locator, baseUrl));
    } catch (error) {
      locatorPromise = undefined;
      throw error;
    }
  })();
  return locatorPromise;
};

const rememberShard = (file: string, request: Promise<EnglishTask[]>) => {
  shardCache.set(file, request);
  if (shardCache.size > SHARD_CACHE_LIMIT) {
    const oldest = shardCache.keys().next().value;
    if (oldest) {
      shardCache.delete(oldest);
    }
  }
};

export const loadEnglishShard = (file: string, baseUrl = ENGLISH_BANK_BASE_URL) => {
  const cached = shardCache.get(file);
  if (cached) {
    return cached;
  }

  const request = (async () => {
    try {
      const manifest = await loadEnglishManifest(baseUrl);
      if (!isSafeShardFile(file) || !manifest.shards.some((shard) => shard.file === file)) {
        throw new Error(`Unknown english shard: ${file}`);
      }
      const payload = await readGzipJson<unknown>(englishUrl(file, baseUrl));
      return englishTaskArraySchema.parse(payload);
    } catch (error) {
      shardCache.delete(file);
      throw error;
    }
  })();

  rememberShard(file, request);
  return request;
};

export const loadEnglishTask = async (id: string, baseUrl = ENGLISH_BANK_BASE_URL) => {
  if (!/^en-ru-\d{5}$/.test(id)) {
    return null;
  }

  const file = (await loadEnglishLocator(baseUrl))[id];
  if (!file) {
    return null;
  }

  const tasks = await loadEnglishShard(file, baseUrl);
  return tasks.find((task) => task.id === id) ?? null;
};

export const loadEnglishGrade = (grade: number, baseUrl = ENGLISH_BANK_BASE_URL) => {
  const cached = gradeCache.get(grade);
  if (cached) {
    return cached;
  }

  const request = (async () => {
    const manifest = await loadEnglishManifest(baseUrl);
    const files = manifest.shards
      .filter((shard) => shard.grade === grade)
      .map((shard) => shard.file);
    const groups = await Promise.all(files.map((file) => loadEnglishShard(file, baseUrl)));
    return groups.flat();
  })().catch((error: unknown) => {
    gradeCache.delete(grade);
    throw error;
  });

  gradeCache.set(grade, request);
  return request;
};

export const clearEnglishBankCache = () => {
  manifestPromise = undefined;
  locatorPromise = undefined;
  shardCache.clear();
  gradeCache.clear();
};
