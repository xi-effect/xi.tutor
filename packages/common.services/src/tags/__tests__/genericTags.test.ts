import { describe, expect, it } from 'vitest';
import { TAG_KIND, TagsQueryKey, tagsApiConfig, tagsQueryKeys } from 'common.api';
import {
  canManageGenericTag,
  filterGenericTags,
  resolveTagsByIds,
  upsertGenericTag,
  removeGenericTag,
} from '../genericTags';

describe('generic tags catalog API', () => {
  it('строит GET всего списка без search и pagination', () => {
    const url = tagsApiConfig[TagsQueryKey.GetGenericTags].getUrl();

    expect(url).toContain('/api/protected/autocomplete-service/tag-kinds/generic/tags/');
    expect(url).not.toContain('roles/tutor');
    expect(url).not.toContain('autocomplete-suggestions');
    expect(url).not.toContain('search=');
    expect(tagsApiConfig[TagsQueryKey.GetGenericTags].method).toBe('GET');
    expect(tagsQueryKeys.genericList()).toEqual([TagsQueryKey.GetGenericTags]);
  });

  it('оставляет autocomplete URL для subject, не для generic-каталога', () => {
    const autocompleteUrl = tagsApiConfig[TagsQueryKey.TagsAutocomplete].getUrl(
      TAG_KIND.Subject,
      'матем',
      10,
    );
    expect(autocompleteUrl).toContain('/tag-kinds/subject/autocomplete-suggestions/');
  });
});

describe('generic tags helpers', () => {
  const tags = [
    { id: 1, name: 'ЕГЭ', color: 'blue' as const, tutor_id: 10 },
    { id: 2, name: 'ОГЭ', color: 'red' as const, tutor_id: 11 },
    { id: 3, name: 'Алгебра', color: 'green' as const, tutor_id: null },
  ];

  it('фильтрует локально без учёта регистра', () => {
    expect(filterGenericTags(tags, 'егэ').map((tag) => tag.id)).toEqual([1]);
    expect(filterGenericTags(tags, '  ').map((tag) => tag.id)).toEqual([1, 2, 3]);
  });

  it('разрешает управление только при tutor_id === user.id', () => {
    expect(canManageGenericTag(tags[0], 10)).toBe(true);
    expect(canManageGenericTag(tags[0], 11)).toBe(false);
    expect(canManageGenericTag(tags[2], 10)).toBe(false);
    expect(canManageGenericTag({ id: 4, name: 'x', color: 'blue' }, 10)).toBe(false);
  });

  it('резолвит tag_ids через каталог и пропускает неизвестные id', () => {
    expect(resolveTagsByIds(tags, [2, 99, 1]).map((tag) => tag.id)).toEqual([2, 1]);
  });

  it('обновляет и удаляет тег в списке', () => {
    const updated = upsertGenericTag(tags, {
      id: 1,
      name: 'ЕГЭ 2027',
      color: 'orange',
      tutor_id: 10,
    });
    expect(updated.find((tag) => tag.id === 1)?.name).toBe('ЕГЭ 2027');
    expect(removeGenericTag(updated, 2).map((tag) => tag.id)).toEqual([1, 3]);
  });
});
