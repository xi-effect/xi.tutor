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

  it('создаёт тред без области — размеры не заданы', () => {
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

    expect(thread.w).toBeUndefined();
    expect(thread.h).toBeUndefined();
  });

  it('создаёт тред с выделенной областью', () => {
    const thread = createCommentThreadRecord({
      pageId: 'page:1',
      x: 200,
      y: 150,
      w: 168,
      h: 158,
      shapeId: null,
      offsetX: null,
      offsetY: null,
      authorId: 'u1',
      authorName: 'Анна',
    });

    expect(thread.w).toBe(168);
    expect(thread.h).toBe(158);
  });

  it('бракованный размер области (NaN / ≤0) — тред остаётся точечным', () => {
    const nan = createCommentThreadRecord({
      pageId: 'page:1',
      x: 0,
      y: 0,
      w: NaN,
      h: 158,
      shapeId: null,
      offsetX: null,
      offsetY: null,
      authorId: 'u1',
      authorName: 'Анна',
    });
    expect(nan.w).toBeUndefined();
    expect(nan.h).toBeUndefined();

    const zero = createCommentThreadRecord({
      pageId: 'page:1',
      x: 0,
      y: 0,
      w: 168,
      h: 0,
      shapeId: null,
      offsetX: null,
      offsetY: null,
      authorId: 'u1',
      authorName: 'Анна',
    });
    expect(zero.w).toBeUndefined();
    expect(zero.h).toBeUndefined();
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
