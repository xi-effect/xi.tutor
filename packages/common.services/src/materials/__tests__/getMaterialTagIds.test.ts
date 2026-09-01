import { describe, expect, it } from 'vitest';
import { getMaterialTagIds } from 'common.types';

describe('getMaterialTagIds', () => {
  it('берёт tag_ids из ответа материала', () => {
    expect(getMaterialTagIds({ tag_ids: [3, 1, 1, 2] })).toEqual([3, 1, 2]);
  });

  it('не подставляет вложенные tags, если есть tag_ids', () => {
    expect(
      getMaterialTagIds({
        tag_ids: [8],
        tags: [{ id: 1 }, { id: 2 }],
      }),
    ).toEqual([8]);
  });

  it('для пустого списка возвращает []', () => {
    expect(getMaterialTagIds({ tag_ids: [] })).toEqual([]);
    expect(getMaterialTagIds({})).toEqual([]);
  });

  it('оставляет не больше пяти тегов', () => {
    expect(getMaterialTagIds({ tag_ids: [1, 2, 3, 4, 5, 6] })).toEqual([1, 2, 3, 4, 5]);
  });
});
