import type { DrRecord, SerializedSchema } from '@ibodr/draw';
import { getIndicesBetween, validateIndexKey, ZERO_INDEX_KEY } from '@ibodr/draw';
import { BOARD_SCHEMA_VERSION, LEGACY_BOARD_SCHEMA_VERSION } from './yjsConstants';

/** Старый клиент мигрировал props xi-geo через sequence geo, не xi-geo. */
const GEO_SHAPE_SEQUENCE = 'com.draw.shape.geo';
const XI_GEO_SHAPE_SEQUENCE = 'com.draw.shape.xi-geo';

export function isLegacyBoardSchemaVersion(
  version: unknown,
): version is typeof LEGACY_BOARD_SCHEMA_VERSION {
  return version === LEGACY_BOARD_SCHEMA_VERSION;
}

function renameTldrawSequenceKey(key: string): string {
  return key.replace(/^com\.tldraw\./, 'com.draw.');
}

function schemaKeys(schema: SerializedSchema): string[] {
  if (schema.schemaVersion === 2) {
    return Object.keys(schema.sequences);
  }

  return Object.keys(schema.recordVersions);
}

export function schemaHasLegacyTldrawSequences(schema: SerializedSchema): boolean {
  return schemaKeys(schema).some((key) => key.startsWith('com.tldraw.'));
}

export function isLegacyTldrawYjsSnapshot(
  schema: SerializedSchema | undefined,
  metaSchemaVersion: unknown,
): boolean {
  if (schema && schemaHasLegacyTldrawSequences(schema)) return true;
  return isLegacyBoardSchemaVersion(metaSchemaVersion);
}

/** com.tldraw.* → com.draw.* в SerializedSchema (V1 recordVersions или V2 sequences). */
export function migrateLegacyTldrawSchema(schema: SerializedSchema): SerializedSchema {
  if (schema.schemaVersion === 2) {
    const sequences: Record<string, number> = {};

    for (const [key, version] of Object.entries(schema.sequences)) {
      sequences[renameTldrawSequenceKey(key)] = version;
    }

    return { schemaVersion: 2, sequences };
  }

  const recordVersions = { ...schema.recordVersions };

  for (const [key, value] of Object.entries(schema.recordVersions)) {
    delete recordVersions[key];
    recordVersions[renameTldrawSequenceKey(key)] = value;
  }

  return { ...schema, recordVersions };
}

/**
 * xi-geo в старом modules.board наследовал geoShapeMigrations без отдельной sequence в Yjs.
 * Без этого migrateStoreSnapshot считает xi-geo «версии 0» и повторно применяет миграции → ломает w/h.
 */
export function inheritLegacyCustomShapeSequenceVersions(
  schema: SerializedSchema,
): SerializedSchema {
  if (schema.schemaVersion !== 2) return schema;

  const sequences = { ...schema.sequences };
  const geoVersion = sequences[GEO_SHAPE_SEQUENCE];

  if (geoVersion == null) return schema;

  const xiGeoVersion = sequences[XI_GEO_SHAPE_SEQUENCE];
  if (xiGeoVersion == null || xiGeoVersion < geoVersion) {
    sequences[XI_GEO_SHAPE_SEQUENCE] = geoVersion;
  }

  return { schemaVersion: 2, sequences };
}

export function schemaNeedsXiGeoSequenceRepair(schema: SerializedSchema): boolean {
  if (schema.schemaVersion !== 2) return false;

  const geoVersion = schema.sequences[GEO_SHAPE_SEQUENCE];
  if (geoVersion == null) return false;

  const xiGeoVersion = schema.sequences[XI_GEO_SHAPE_SEQUENCE];
  return xiGeoVersion == null || xiGeoVersion < geoVersion;
}

function isShapeRecord(
  record: DrRecord,
): record is DrRecord & { type: string; props: Record<string, unknown> } {
  return record.typeName === 'shape' && typeof (record as { type?: unknown }).type === 'string';
}

function fixPositiveNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}

function isValidIndexKey(index: unknown): boolean {
  if (typeof index !== 'string' || !index) return false;
  try {
    validateIndexKey(index);
    return true;
  } catch {
    return false;
  }
}

type ShapeWithIndex = DrRecord & { parentId: string; index: string };

/**
 * tldraw v3 мог сохранять index-ключи (напр. aY550), невалидные для jittered-fractional-indexing в draw.
 * Пересчитываем index внутри каждого parentId, сохраняя z-order.
 */
export function repairInvalidShapeIndexKeys(
  store: Record<string, DrRecord>,
): Record<string, DrRecord> {
  const shapesByParent = new Map<string, Array<{ id: string; shape: ShapeWithIndex }>>();

  for (const [id, record] of Object.entries(store)) {
    if (!isShapeRecord(record)) continue;

    const shape = record as ShapeWithIndex;
    if (typeof shape.parentId !== 'string') continue;

    const list = shapesByParent.get(shape.parentId) ?? [];
    list.push({ id, shape });
    shapesByParent.set(shape.parentId, list);
  }

  let changed = false;
  const next: Record<string, DrRecord> = { ...store };

  for (const shapes of shapesByParent.values()) {
    if (!shapes.some(({ shape }) => !isValidIndexKey(shape.index))) continue;

    changed = true;

    const sorted = [...shapes].sort((a, b) =>
      a.shape.index < b.shape.index ? -1 : a.shape.index > b.shape.index ? 1 : 0,
    );
    const newIndices = getIndicesBetween(ZERO_INDEX_KEY, null, sorted.length);

    for (let i = 0; i < sorted.length; i++) {
      const { id, shape } = sorted[i];
      const index = newIndices[i];
      if (shape.index === index) continue;
      next[id] = { ...shape, index } as DrRecord;
    }
  }

  return changed ? next : store;
}

/**
 * Доп. правки shape-записей после migrateStoreSnapshot для legacy-досок.
 * Идempotent — безопасно вызывать повторно.
 */
export function repairLegacyBoardShapeRecords(
  store: Record<string, DrRecord>,
): Record<string, DrRecord> {
  let changed = false;
  const next: Record<string, DrRecord> = { ...store };

  for (const [id, record] of Object.entries(next)) {
    if (!isShapeRecord(record)) continue;

    if (record.type === 'geo') {
      changed = true;
      next[id] = {
        ...record,
        type: 'xi-geo',
        props: {
          ...record.props,
          borderColor: record.props.borderColor ?? 'black',
          text: typeof record.props.text === 'string' ? record.props.text : '',
          scale: fixPositiveNumber(record.props.scale, 1),
          w: fixPositiveNumber(record.props.w, 100),
          h: fixPositiveNumber(record.props.h, 100),
        },
      } as DrRecord;
      continue;
    }

    if (record.type !== 'xi-geo') continue;

    const props = record.props;
    const borderColor = props.borderColor ?? 'black';
    const text = typeof props.text === 'string' ? props.text : '';
    const scale = fixPositiveNumber(props.scale, 1);
    const w = fixPositiveNumber(props.w, 100);
    const h = fixPositiveNumber(props.h, 100);

    if (
      props.borderColor === borderColor &&
      props.text === text &&
      props.scale === scale &&
      props.w === w &&
      props.h === h
    ) {
      continue;
    }

    changed = true;
    next[id] = {
      ...record,
      props: { ...props, borderColor, text, scale, w, h },
    } as DrRecord;
  }

  return changed ? next : store;
}

export function repairMigratedBoardStore(
  store: Record<string, DrRecord>,
): Record<string, DrRecord> {
  return repairInvalidShapeIndexKeys(repairLegacyBoardShapeRecords(store));
}

/**
 * Переименовывает legacy-префиксы в snapshot store:
 * - com.tldraw.* → com.draw.* (meta / style keys)
 * - tldraw:* → draw:*
 */
export function migrateLegacyTldrawRecords(
  store: Record<string, DrRecord>,
): Record<string, DrRecord> {
  const json = JSON.stringify(store);
  const migrated = json.replace(/com\.tldraw\./g, 'com.draw.').replace(/tldraw:/g, 'draw:');
  return JSON.parse(migrated) as Record<string, DrRecord>;
}

export type PreparedYjsStoreSnapshot = {
  schema: SerializedSchema;
  store: Record<string, DrRecord>;
  wasLegacy: boolean;
  needsShapeRepair: boolean;
};

/** Подготавливает Yjs-snapshot старой доски (tldraw v3) к migrateStoreSnapshot @ibodr/draw. */
export function prepareLegacyYjsStoreSnapshot(args: {
  schema: SerializedSchema;
  store: Record<string, DrRecord>;
  metaSchemaVersion: unknown;
}): PreparedYjsStoreSnapshot {
  const wasLegacy = isLegacyTldrawYjsSnapshot(args.schema, args.metaSchemaVersion);

  const schema = inheritLegacyCustomShapeSequenceVersions(
    wasLegacy ? migrateLegacyTldrawSchema(args.schema) : args.schema,
  );
  const store = wasLegacy ? migrateLegacyTldrawRecords(args.store) : args.store;
  const needsShapeRepair = wasLegacy || schemaNeedsXiGeoSequenceRepair(schema);

  if (!wasLegacy && !needsShapeRepair) {
    return { schema: args.schema, store: args.store, wasLegacy: false, needsShapeRepair: false };
  }

  return { schema, store, wasLegacy, needsShapeRepair };
}

export function nextBoardSchemaVersion(metaSchemaVersion: unknown, wasLegacy: boolean): string {
  if (wasLegacy || isLegacyBoardSchemaVersion(metaSchemaVersion)) {
    return BOARD_SCHEMA_VERSION;
  }

  return typeof metaSchemaVersion === 'string' && metaSchemaVersion.length > 0
    ? metaSchemaVersion
    : BOARD_SCHEMA_VERSION;
}
