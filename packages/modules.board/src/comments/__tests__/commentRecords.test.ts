import { describe, expect, it } from 'vitest';
import { createCommentMessageRecord, createCommentThreadRecord } from '../commentRecords';

describe('commentRecords', () => {
  it('создаёт тред с пином на странице', () => {
    const thread = createCommentThreadRecord({
      pageId: 'page:1',
      x: 10,
      y: 20,
      shapeId: null,
      offsetX: null,
      offsetY: null,
      authorId: 'u1',
      authorName: 'Анна',
    });

    expect(thread.typeName).toBe('comment_thread');
    expect(thread.pageId).toBe('page:1');
    expect(thread.resolved).toBe(false);
    expect(thread.authorName).toBe('Анна');
    expect(String(thread.id)).toContain('comment_thread');
  });

  it('создаёт сообщение в треде', () => {
    const thread = createCommentThreadRecord({
      pageId: 'page:1',
      x: 0,
      y: 0,
      shapeId: 'shape:1',
      offsetX: 1,
      offsetY: 2,
      authorId: 'u1',
      authorName: 'Анна',
    });
    const message = createCommentMessageRecord({
      threadId: thread.id,
      text: 'Привет',
      authorId: 'u1',
      authorName: 'Анна',
    });

    expect(message.typeName).toBe('comment_message');
    expect(message.threadId).toBe(thread.id);
    expect(message.text).toBe('Привет');
  });
});
