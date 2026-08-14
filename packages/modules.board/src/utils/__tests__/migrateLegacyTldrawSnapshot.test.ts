import { describe, expect, it } from 'vitest';
import {
  isLegacyBoardSchemaVersion,
  isLegacyTldrawYjsSnapshot,
  migrateLegacyTldrawSchema,
  schemaHasLegacyTldrawSequences,
} from '../migrateLegacyTldrawSnapshot';

describe('legacy tldraw migration helpers', () => {
  it('распознаёт legacy schemaVersion', () => {
    expect(isLegacyBoardSchemaVersion('tldraw')).toBe(true);
    expect(isLegacyBoardSchemaVersion('draw')).toBe(false);
  });

  it('видит com.tldraw.* в sequences', () => {
    const schema = {
      schemaVersion: 2 as const,
      sequences: { 'com.tldraw.shape.geo': 1, 'com.draw.shape.text': 1 },
    };
    expect(schemaHasLegacyTldrawSequences(schema)).toBe(true);
    expect(isLegacyTldrawYjsSnapshot(schema, 'draw')).toBe(true);
  });

  it('переименовывает sequences com.tldraw → com.draw', () => {
    expect(
      migrateLegacyTldrawSchema({
        schemaVersion: 2,
        sequences: { 'com.tldraw.shape.geo': 4 },
      }),
    ).toEqual({
      schemaVersion: 2,
      sequences: { 'com.draw.shape.geo': 4 },
    });
  });
});
