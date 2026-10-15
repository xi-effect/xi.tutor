import { describe, expect, it } from 'vitest';
import { createEditorCommentMessageId, createEditorCommentThreadId } from '../commentRecords';

describe('commentRecords', () => {
  it('создаёт непустой id треда', () => {
    expect(createEditorCommentThreadId()).toEqual(expect.any(String));
    expect(createEditorCommentThreadId().length).toBeGreaterThan(0);
  });

  it('создаёт непустой id сообщения', () => {
    expect(createEditorCommentMessageId()).toEqual(expect.any(String));
    expect(createEditorCommentMessageId().length).toBeGreaterThan(0);
  });

  it('id уникальны', () => {
    const ids = new Set(Array.from({ length: 100 }, () => createEditorCommentThreadId()));
    expect(ids.size).toBe(100);
    expect(createEditorCommentThreadId()).not.toBe(createEditorCommentMessageId());
  });
});
