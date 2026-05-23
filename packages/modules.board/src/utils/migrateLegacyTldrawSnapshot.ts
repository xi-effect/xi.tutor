import type { DrRecord, SerializedSchema } from '@ibodr/draw';
import { BOARD_SCHEMA_VERSION, LEGACY_BOARD_SCHEMA_VERSION } from './yjsConstants';

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
};

/** Подготавливает Yjs-snapshot старой доски (tldraw v3) к migrateStoreSnapshot @ibodr/draw. */
export function prepareLegacyYjsStoreSnapshot(args: {
  schema: SerializedSchema;
  store: Record<string, DrRecord>;
  metaSchemaVersion: unknown;
}): PreparedYjsStoreSnapshot {
  const wasLegacy = isLegacyTldrawYjsSnapshot(args.schema, args.metaSchemaVersion);

  if (!wasLegacy) {
    return { schema: args.schema, store: args.store, wasLegacy: false };
  }

  return {
    schema: migrateLegacyTldrawSchema(args.schema),
    store: migrateLegacyTldrawRecords(args.store),
    wasLegacy: true,
  };
}

export function nextBoardSchemaVersion(metaSchemaVersion: unknown, wasLegacy: boolean): string {
  if (wasLegacy || isLegacyBoardSchemaVersion(metaSchemaVersion)) {
    return BOARD_SCHEMA_VERSION;
  }

  return typeof metaSchemaVersion === 'string' && metaSchemaVersion.length > 0
    ? metaSchemaVersion
    : BOARD_SCHEMA_VERSION;
}
