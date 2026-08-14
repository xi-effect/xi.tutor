import { describe, expect, it } from 'vitest';
import {
  buildBoardDeepLink,
  hasBoardDeepLinkSearch,
  parseShapeIdsFromSearch,
} from '../boardDeepLink';

describe('parseShapeIdsFromSearch', () => {
  it('разбирает список id через запятую', () => {
    expect(parseShapeIdsFromSearch('a, b, ,c')).toEqual(['a', 'b', 'c']);
  });

  it('возвращает пустой массив без параметра', () => {
    expect(parseShapeIdsFromSearch()).toEqual([]);
    expect(parseShapeIdsFromSearch('')).toEqual([]);
  });
});

describe('hasBoardDeepLinkSearch', () => {
  it('true если есть shape или comment', () => {
    expect(hasBoardDeepLinkSearch({ shape: 's1' })).toBe(true);
    expect(hasBoardDeepLinkSearch({ comment: 'c1' })).toBe(true);
    expect(hasBoardDeepLinkSearch({ call: '1' })).toBe(false);
    expect(hasBoardDeepLinkSearch({})).toBe(false);
  });
});

describe('buildBoardDeepLink', () => {
  it('собирает URL с shape, comment и сохраняет call', () => {
    expect(
      buildBoardDeepLink({
        pathname: '/classrooms/1/boards/2',
        origin: 'https://app.sovlium.ru',
        currentSearch: { call: 'room-1' },
        shapeIds: ['shape:1', 'shape:2'],
        commentId: 'thread:9',
      }),
    ).toBe(
      'https://app.sovlium.ru/classrooms/1/boards/2?call=room-1&shape=shape%3A1%2Cshape%3A2&comment=thread%3A9',
    );
  });

  it('без query возвращает чистый pathname', () => {
    expect(
      buildBoardDeepLink({
        pathname: '/board/abc',
        origin: 'https://app.sovlium.ru',
      }),
    ).toBe('https://app.sovlium.ru/board/abc');
  });
});
