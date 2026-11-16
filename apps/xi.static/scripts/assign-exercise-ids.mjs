// Проставляет стабильный exerciseId (UUID) во все задания банка.
// Повторный запуск сохраняет уже записанные UUID. Сначала читаются исходники.
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SOURCE_FILES = [
  'apps/xi.static/content/tasks.source.json.gz',
  'apps/xi.static/content/russian/tasks.source.json.gz',
  'apps/xi.static/content/physics/tasks.json.gz',
  'apps/xi.static/content/english/tasks.json.gz',
];

const ROOTS = ['apps/xi.static/content', 'apps/xi.static/public', 'packages/features.bank/public'];

const exerciseIdByTaskId = new Map();
const seenPaths = new Set();

const isUuid = (value) => typeof value === 'string' && UUID_RE.test(value);

const isTaskArray = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  return data.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      !Array.isArray(item) &&
      typeof item.id === 'string' &&
      (typeof item.statement === 'string' ||
        typeof item.statementPreview === 'string' ||
        (item.statement && typeof item.statement === 'object') ||
        item.subject === 'mathematics' ||
        item.subject === 'russian' ||
        item.subject === 'physics' ||
        item.subject === 'english'),
  );
};

const withExerciseId = (item, exerciseId) => {
  if (item.exerciseId === exerciseId) {
    const keys = Object.keys(item);
    if (keys[1] === 'exerciseId') {
      return item;
    }
  }

  const next = {};
  let placed = false;
  for (const [key, value] of Object.entries(item)) {
    if (key === 'exerciseId') {
      continue;
    }
    next[key] = value;
    if (key === 'id') {
      next.exerciseId = exerciseId;
      placed = true;
    }
  }
  if (!placed) {
    next.exerciseId = exerciseId;
  }
  return next;
};

const loadFile = (path) => {
  const gzip = path.endsWith('.gz');
  const bytes = readFileSync(path);
  const text = gzip ? gunzipSync(bytes).toString('utf8') : bytes.toString('utf8');
  return {
    gzip,
    pretty: !gzip && text.includes('\n'),
    data: JSON.parse(text),
  };
};

const saveFile = (path, payload, pretty) => {
  if (path.endsWith('.gz')) {
    writeFileSync(path, gzipSync(Buffer.from(JSON.stringify(payload)), { level: 9 }));
    return;
  }

  const text = pretty ? `${JSON.stringify(payload, null, 2)}\n` : JSON.stringify(payload);
  writeFileSync(path, text);
};

const resolveExerciseId = (item, allowCreate) => {
  const known = exerciseIdByTaskId.get(item.id);
  if (known) {
    return known;
  }
  if (!allowCreate) {
    throw new Error(`Нет UUID для задания ${item.id}`);
  }

  const existing = isUuid(item.exerciseId) ? item.exerciseId : null;
  const exerciseId = existing ?? randomUUID();
  exerciseIdByTaskId.set(item.id, exerciseId);
  return exerciseId;
};

const stampFile = (path, allowCreate) => {
  if (seenPaths.has(path)) {
    return { path, skipped: true };
  }
  seenPaths.add(path);

  const loaded = loadFile(path);
  if (!isTaskArray(loaded.data)) {
    return { path, skipped: true };
  }

  let changed = false;
  const next = loaded.data.map((item) => {
    const exerciseId = resolveExerciseId(item, allowCreate);
    const stamped = withExerciseId(item, exerciseId);
    if (stamped !== item) {
      changed = true;
    }
    return stamped;
  });

  if (changed) {
    saveFile(path, next, loaded.pretty);
  }

  return { path, skipped: false, changed, count: next.length };
};

const walk = (dir, files = []) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path, files);
      continue;
    }
    if (name.endsWith('.json') || name.endsWith('.json.gz')) {
      files.push(path);
    }
  }
  return files;
};

const refreshManifest = (path) => {
  const loaded = loadFile(path);
  if (!loaded.data || !Array.isArray(loaded.data.shards)) {
    return false;
  }

  const dir = path.slice(0, path.lastIndexOf('/'));
  let changed = false;
  for (const shard of loaded.data.shards) {
    if (!shard || typeof shard.file !== 'string') {
      continue;
    }
    const hash = createHash('sha256').update(readFileSync(join(dir, shard.file))).digest('hex');
    if (shard.sha256 !== hash) {
      shard.sha256 = hash;
      changed = true;
    }
  }

  if (changed) {
    saveFile(path, loaded.data, true);
  }
  return changed;
};

const sourceResults = SOURCE_FILES.map((path) => stampFile(path, true));
const otherResults = [];
for (const root of ROOTS) {
  for (const path of walk(root)) {
    otherResults.push(stampFile(path, false));
  }
}

const manifests = [
  'apps/xi.static/public/task-bank/physics/manifest.json',
  'apps/xi.static/public/task-bank/english/manifest.json',
].filter((path) => {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
});
const refreshedManifests = manifests.filter((path) => refreshManifest(path));

const uniqueExerciseIds = new Set(exerciseIdByTaskId.values());
if (uniqueExerciseIds.size !== exerciseIdByTaskId.size) {
  throw new Error('Коллизия exerciseId');
}

const rewritten = [...sourceResults, ...otherResults].filter((result) => result.changed);
console.log(
  JSON.stringify(
    {
      tasks: exerciseIdByTaskId.size,
      rewritten: rewritten.length,
      manifests: refreshedManifests,
    },
    null,
    2,
  ),
);
