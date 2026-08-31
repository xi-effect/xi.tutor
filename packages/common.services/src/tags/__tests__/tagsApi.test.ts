import { describe, expect, it } from 'vitest';
import {
  TAG_KIND,
  TAG_AUTOCOMPLETE_DEFAULT_LIMIT,
  TAG_AUTOCOMPLETE_MAX_LIMIT,
  TagsQueryKey,
  tagsApiConfig,
  tagsQueryKeys,
  normalizeTagAutocompleteLimit,
} from 'common.api';

const DEPRECATED_SUBJECTS_PATH = '/api/protected/autocomplete-service/subjects/';

describe('tags API', () => {
  it('строит autocomplete URL через tag-kinds, а не deprecated /subjects', () => {
    const url = tagsApiConfig[TagsQueryKey.TagsAutocomplete].getUrl(TAG_KIND.Subject, 'матем', 10);

    expect(url).toContain(
      '/api/protected/autocomplete-service/tag-kinds/subject/autocomplete-suggestions/',
    );
    expect(url).toContain('search=%D0%BC%D0%B0%D1%82%D0%B5%D0%BC');
    expect(url).toContain('limit=10');
    expect(url).not.toContain(DEPRECATED_SUBJECTS_PATH);
    expect(url).not.toContain('/subjects/autocomplete-suggestions/');
  });

  it('передаёт search и limit в query string', () => {
    const url = tagsApiConfig[TagsQueryKey.TagsAutocomplete].getUrl(TAG_KIND.Subject, 'algebra', 7);

    expect(url).toContain('search=algebra');
    expect(url).toContain('limit=7');
  });

  it('ограничивает limit максимумом 20', () => {
    const url = tagsApiConfig[TagsQueryKey.TagsAutocomplete].getUrl(TAG_KIND.Subject, 'math', 100);

    expect(url).toContain(`limit=${TAG_AUTOCOMPLETE_MAX_LIMIT}`);
    expect(normalizeTagAutocompleteLimit(100)).toBe(TAG_AUTOCOMPLETE_MAX_LIMIT);
    expect(normalizeTagAutocompleteLimit()).toBe(TAG_AUTOCOMPLETE_DEFAULT_LIMIT);
  });

  it('строит URL получения тега по id для subject kind', () => {
    const url = tagsApiConfig[TagsQueryKey.GetTagById].getUrl(TAG_KIND.Subject, 42);

    expect(url).toContain('/api/protected/autocomplete-service/tag-kinds/subject/tags/42/');
    expect(url).not.toContain(DEPRECATED_SUBJECTS_PATH);
    expect(url).not.toMatch(/\/subjects\/42\//);
  });

  it('использует тот же контракт URL для generic kind', () => {
    const autocompleteUrl = tagsApiConfig[TagsQueryKey.TagsAutocomplete].getUrl(
      TAG_KIND.Generic,
      'file',
      5,
    );
    const byIdUrl = tagsApiConfig[TagsQueryKey.GetTagById].getUrl(TAG_KIND.Generic, 3);

    expect(autocompleteUrl).toContain('/tag-kinds/generic/autocomplete-suggestions/');
    expect(byIdUrl).toContain('/tag-kinds/generic/tags/3/');
  });

  it('строит CRUD URL тегов репетитора через roles/tutor/tag-kinds', () => {
    const createUrl = tagsApiConfig[TagsQueryKey.CreateTag].getUrl(TAG_KIND.Generic);
    const updateUrl = tagsApiConfig[TagsQueryKey.UpdateTag].getUrl(TAG_KIND.Generic, 7);
    const deleteUrl = tagsApiConfig[TagsQueryKey.DeleteTag].getUrl(TAG_KIND.Generic, 7);

    expect(createUrl).toContain(
      '/api/protected/autocomplete-service/roles/tutor/tag-kinds/generic/tags/',
    );
    expect(updateUrl).toContain(
      '/api/protected/autocomplete-service/roles/tutor/tag-kinds/generic/tags/7/',
    );
    expect(deleteUrl).toBe(updateUrl);
    expect(tagsApiConfig[TagsQueryKey.CreateTag].method).toBe('POST');
    expect(tagsApiConfig[TagsQueryKey.UpdateTag].method).toBe('PATCH');
    expect(tagsApiConfig[TagsQueryKey.DeleteTag].method).toBe('DELETE');
  });

  it('кладёт kind в query keys, чтобы subject и generic не пересекались', () => {
    expect(tagsQueryKeys.autocomplete(TAG_KIND.Subject, 'math', 10)).toEqual([
      TagsQueryKey.TagsAutocomplete,
      'subject',
      'math',
      10,
    ]);
    expect(tagsQueryKeys.byId(TAG_KIND.Subject, 1)).toEqual([
      TagsQueryKey.GetTagById,
      'subject',
      1,
    ]);
    expect(tagsQueryKeys.autocomplete(TAG_KIND.Generic, 'math', 10)).not.toEqual(
      tagsQueryKeys.autocomplete(TAG_KIND.Subject, 'math', 10),
    );
  });
});
