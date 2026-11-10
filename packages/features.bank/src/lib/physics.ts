import { PHYSICS_BANK_BASE_URL } from '../model/constants';
import {
  physicsManifestSchema,
  physicsTaskArraySchema,
  type PhysicsManifest,
  type PhysicsTask,
} from '../model/physics';
import { readGzipJson, readJson } from './fetchJson';

const SHARD_CACHE_LIMIT = 8;

let manifestPromise: Promise<PhysicsManifest> | undefined;
let locatorPromise: Promise<Record<string, string>> | undefined;
const shardCache = new Map<string, Promise<PhysicsTask[]>>();
const gradeCache = new Map<number, Promise<PhysicsTask[]>>();

const physicsUrl = (file: string, baseUrl = PHYSICS_BANK_BASE_URL) => {
  const base = baseUrl.replace(/\/$/, '');
  return `${base}/${file.replace(/^\/+/, '')}`;
};

const isSafeShardFile = (file: string) => /^grade-(?:5|6|7|8|9|10|11)-\d{3}\.json\.gz$/.test(file);

export const loadPhysicsManifest = (baseUrl = PHYSICS_BANK_BASE_URL) => {
  manifestPromise ??= readJson<unknown>(physicsUrl('manifest.json', baseUrl))
    .then((payload) => physicsManifestSchema.parse(payload))
    .catch((error: unknown) => {
      manifestPromise = undefined;
      throw error;
    });
  return manifestPromise;
};

export const loadPhysicsLocator = async (baseUrl = PHYSICS_BANK_BASE_URL) => {
  locatorPromise ??= (async () => {
    try {
      const manifest = await loadPhysicsManifest(baseUrl);
      return await readGzipJson<Record<string, string>>(physicsUrl(manifest.locator, baseUrl));
    } catch (error) {
      locatorPromise = undefined;
      throw error;
    }
  })();
  return locatorPromise;
};

const rememberShard = (file: string, request: Promise<PhysicsTask[]>) => {
  shardCache.set(file, request);
  if (shardCache.size > SHARD_CACHE_LIMIT) {
    const oldest = shardCache.keys().next().value;
    if (oldest) {
      shardCache.delete(oldest);
    }
  }
};

export const loadPhysicsShard = (file: string, baseUrl = PHYSICS_BANK_BASE_URL) => {
  const cached = shardCache.get(file);
  if (cached) {
    return cached;
  }

  const request = (async () => {
    try {
      const manifest = await loadPhysicsManifest(baseUrl);
      if (!isSafeShardFile(file) || !manifest.shards.some((shard) => shard.file === file)) {
        throw new Error(`Unknown physics shard: ${file}`);
      }
      const payload = await readGzipJson<unknown>(physicsUrl(file, baseUrl));
      return physicsTaskArraySchema.parse(payload);
    } catch (error) {
      shardCache.delete(file);
      throw error;
    }
  })();

  rememberShard(file, request);
  return request;
};

export const loadPhysicsTask = async (id: string, baseUrl = PHYSICS_BANK_BASE_URL) => {
  if (!/^physics-ru-\d{5}$/.test(id)) {
    return null;
  }

  const file = (await loadPhysicsLocator(baseUrl))[id];
  if (!file) {
    return null;
  }

  const tasks = await loadPhysicsShard(file, baseUrl);
  return tasks.find((task) => task.id === id) ?? null;
};

export const loadPhysicsGrade = (grade: number, baseUrl = PHYSICS_BANK_BASE_URL) => {
  const cached = gradeCache.get(grade);
  if (cached) {
    return cached;
  }

  const request = (async () => {
    const manifest = await loadPhysicsManifest(baseUrl);
    const files = manifest.shards
      .filter((shard) => shard.grade === grade)
      .map((shard) => shard.file);
    const groups = await Promise.all(files.map((file) => loadPhysicsShard(file, baseUrl)));
    return groups.flat();
  })().catch((error: unknown) => {
    gradeCache.delete(grade);
    throw error;
  });

  gradeCache.set(grade, request);
  return request;
};

export const clearPhysicsBankCache = () => {
  manifestPromise = undefined;
  locatorPromise = undefined;
  shardCache.clear();
  gradeCache.clear();
};
