import { describe, expect, it } from 'vitest';
import { selectCursorPresences, type CursorPresence } from '../cursorPresences';

function presence(
  overrides: Partial<CursorPresence> & Pick<CursorPresence, 'id' | 'userId'>,
): CursorPresence {
  return { cursor: { x: 0, y: 0 }, lastActivityTimestamp: 0, ...overrides };
}

describe('selectCursorPresences', () => {
  it('не показывает свою сессию ни по presence, ни по user, ни по backend id', () => {
    const mine = presence({
      id: 'presence:me',
      userId: 'user:me',
      meta: { backendUserId: 7 },
    });
    const otherTab = presence({
      id: 'presence:tab',
      userId: 'user:tab',
      meta: { backendUserId: '7' },
    });
    const guest = presence({ id: 'presence:guest', userId: 'user:guest' });

    expect(
      selectCursorPresences([mine, otherTab, guest], {
        myPresenceId: 'presence:me',
        myUserId: 'user:me',
        myBackendUserId: '7',
      }).map((item) => item.id),
    ).toEqual(['presence:guest']);
  });

  it('оставляет один курсор на backendUserId — тот, что новее и с точкой', () => {
    const older = presence({
      id: 'presence:a',
      userId: 'user:a',
      lastActivityTimestamp: 10,
      meta: { backendUserId: '4' },
      cursor: { x: 1, y: 1 },
    });
    const newerWithoutCursor = presence({
      id: 'presence:b',
      userId: 'user:b',
      lastActivityTimestamp: 50,
      meta: { backendUserId: '4' },
      cursor: null,
    });
    const newer = presence({
      id: 'presence:c',
      userId: 'user:c',
      lastActivityTimestamp: 20,
      meta: { backendUserId: '4' },
      cursor: { x: 2, y: 2 },
    });

    expect(
      selectCursorPresences([older, newerWithoutCursor, newer], {}).map((item) => item.id),
    ).toEqual(['presence:c']);
  });
});
