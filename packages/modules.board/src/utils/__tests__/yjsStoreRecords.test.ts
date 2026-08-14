import { describe, expect, it } from 'vitest';
import { normalizeRecordForYjsPersistence } from '../yjsStoreRecords';

describe('normalizeRecordForYjsPersistence', () => {
  it('не трогает запись без src', () => {
    const record = { id: 'shape:1', typeName: 'shape', props: { w: 10 } };
    expect(normalizeRecordForYjsPersistence(record as never)).toBe(record);
  });

  it('нормализует legacy URL в props.src', () => {
    const id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const record = {
      id: 'asset:1',
      typeName: 'asset',
      props: { src: `https://api.sovlium.ru/storage-service/v2/files/${id}/` },
    };

    expect(normalizeRecordForYjsPersistence(record as never)).toEqual({
      ...record,
      props: { src: id },
    });
  });
});
