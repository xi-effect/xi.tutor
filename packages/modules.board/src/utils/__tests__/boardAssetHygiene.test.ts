import { describe, expect, it } from 'vitest';
import type { DrRecord } from '@ibodr/draw';
import {
  findOrphanAssetIds,
  pruneBoardRecordsForPersistence,
  stripInlineAssetSrc,
  stripInlineSourcesFromContent,
} from '../boardAssetHygiene';

describe('stripInlineAssetSrc', () => {
  it('не трогает file id', () => {
    const record = {
      id: 'asset:1',
      typeName: 'asset',
      props: { src: 'file-id' },
    } as DrRecord;
    expect(stripInlineAssetSrc(record)).toBe(record);
  });

  it('подставляет originalSrc вместо data:', () => {
    const record = {
      id: 'asset:1',
      typeName: 'asset',
      props: { src: 'data:image/png;base64,abc' },
      meta: { originalSrc: 'file-id' },
    } as DrRecord;
    expect(stripInlineAssetSrc(record)).toEqual({
      ...record,
      props: { src: 'file-id' },
    });
  });
});

describe('findOrphanAssetIds', () => {
  it('находит asset без ссылок из shape', () => {
    const records: Record<string, DrRecord> = {
      'asset:used': { id: 'asset:used', typeName: 'asset', props: { src: 'a' } } as DrRecord,
      'asset:orphan': { id: 'asset:orphan', typeName: 'asset', props: { src: 'b' } } as DrRecord,
      'shape:1': {
        id: 'shape:1',
        typeName: 'shape',
        props: { assetId: 'asset:used' },
      } as DrRecord,
    };

    expect(findOrphanAssetIds(records)).toEqual(['asset:orphan']);
  });

  it('учитывает картинки на flip-card', () => {
    const records: Record<string, DrRecord> = {
      'asset:front': { id: 'asset:front', typeName: 'asset' } as DrRecord,
      'asset:back': { id: 'asset:back', typeName: 'asset' } as DrRecord,
      'shape:card': {
        id: 'shape:card',
        typeName: 'shape',
        props: { frontImageAssetId: 'asset:front', backImageAssetId: 'asset:back' },
      } as DrRecord,
    };

    expect(findOrphanAssetIds(records)).toEqual([]);
  });
});

describe('pruneBoardRecordsForPersistence', () => {
  it('снимает inline src и удаляет сирот', () => {
    const pruned = pruneBoardRecordsForPersistence({
      'asset:used': {
        id: 'asset:used',
        typeName: 'asset',
        props: { src: 'data:image/png;base64,abc' },
        meta: { originalSrc: 'file-id' },
      } as DrRecord,
      'asset:orphan': {
        id: 'asset:orphan',
        typeName: 'asset',
        props: { src: 'data:image/png;base64,xyz' },
        meta: {},
      } as DrRecord,
      'shape:1': {
        id: 'shape:1',
        typeName: 'shape',
        props: { assetId: 'asset:used' },
      } as DrRecord,
    });

    expect(pruned['asset:orphan']).toBeUndefined();
    expect((pruned['asset:used'] as { props: { src: string } }).props.src).toBe('file-id');
  });
});

describe('stripInlineSourcesFromContent', () => {
  it('обнуляет data: в clipboard content', () => {
    const content = {
      assets: [
        {
          id: 'asset:1',
          props: { src: 'data:image/png;base64,abc', name: 'image.png' },
          meta: {},
        },
      ],
    };

    stripInlineSourcesFromContent(content);
    expect(content.assets[0].props.src).toBe('');
  });
});
