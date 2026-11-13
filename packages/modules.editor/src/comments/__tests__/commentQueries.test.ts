import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Schema } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/react';
import * as Y from 'yjs';
import {
  addCommentReply,
  createCommentThreadAt,
  deleteCommentMessage,
  deleteCommentThread,
  getAllCommentThreads,
  getThreadMarkRange,
  getThreadMessages,
  setCommentThreadResolved,
  type NewCommentAuthor,
} from '../commentQueries';
import type { EditorCommentMessage, EditorCommentThread } from '../commentRecords';

vi.mock('../../utils/userColor', () => ({
  generateUserColor: (id: string) => `color-${id}`,
}));

const author: NewCommentAuthor = { authorId: 'u1', authorName: 'Анна' };

const makeMaps = () => {
  const doc = new Y.Doc();
  return {
    threadsMap: doc.getMap<EditorCommentThread>('threads'),
    messagesMap: doc.getMap<EditorCommentMessage>('messages'),
  };
};

const makeThread = (id: string, over: Partial<EditorCommentThread> = {}): EditorCommentThread => ({
  id,
  resolved: false,
  createdAt: 1,
  authorId: 'u1',
  authorName: 'Анна',
  ...over,
});

const makeMessage = (
  id: string,
  threadId: string,
  createdAt: number,
  text = id,
): EditorCommentMessage => ({
  id,
  threadId,
  text,
  authorId: 'u1',
  authorName: 'Анна',
  createdAt,
});

/** Мини-редактор: getThreadMarkRange использует только editor.state.doc. */
const schema = new Schema({
  nodes: {
    doc: { content: 'paragraph+' },
    paragraph: { content: 'text*', group: 'block' },
    text: { group: 'inline' },
  },
  marks: {
    comment: { attrs: { threadId: { default: null } } },
    bold: {},
  },
});

type Piece = { text: string; threadId?: string; bold?: boolean };

const makeEditorWithDoc = (paragraphs: Piece[][]): Editor => {
  const doc = schema.node(
    'doc',
    null,
    paragraphs.map((pieces) =>
      schema.node(
        'paragraph',
        null,
        pieces.map((p) => {
          const marks = [];
          if (p.threadId) marks.push(schema.marks.comment.create({ threadId: p.threadId }));
          if (p.bold) marks.push(schema.marks.bold.create());
          return schema.text(p.text, marks);
        }),
      ),
    ),
  );
  return { state: { doc } } as unknown as Editor;
};

/** Мок-редактор для команд: setTextSelection → setComment → run, unsetComment. */
const makeCommandEditor = () => {
  const chain = {
    setTextSelection: vi.fn(),
    setComment: vi.fn(),
    run: vi.fn(),
  };
  chain.setTextSelection.mockReturnValue(chain);
  chain.setComment.mockReturnValue(chain);
  const editor = {
    chain: vi.fn(() => chain),
    commands: { unsetComment: vi.fn() },
  };
  return { editor: editor as unknown as Editor, chain, unsetComment: editor.commands.unsetComment };
};

describe('getAllCommentThreads', () => {
  it('пустая карта — пустой массив', () => {
    const { threadsMap } = makeMaps();
    expect(getAllCommentThreads(threadsMap)).toEqual([]);
  });

  it('возвращает все треды', () => {
    const { threadsMap } = makeMaps();
    threadsMap.set('a', makeThread('a'));
    threadsMap.set('b', makeThread('b'));
    expect(
      getAllCommentThreads(threadsMap)
        .map((t) => t.id)
        .sort(),
    ).toEqual(['a', 'b']);
  });
});

describe('getThreadMessages', () => {
  it('фильтрует по threadId и сортирует по createdAt', () => {
    const { messagesMap } = makeMaps();
    messagesMap.set('m3', makeMessage('m3', 't1', 30));
    messagesMap.set('m1', makeMessage('m1', 't1', 10));
    messagesMap.set('x', makeMessage('x', 't2', 20));
    messagesMap.set('m2', makeMessage('m2', 't1', 20));

    expect(getThreadMessages(messagesMap, 't1').map((m) => m.id)).toEqual(['m1', 'm2', 'm3']);
  });

  it('у треда без сообщений — пустой массив', () => {
    const { messagesMap } = makeMaps();
    expect(getThreadMessages(messagesMap, 'nope')).toEqual([]);
  });
});

describe('getThreadMarkRange', () => {
  it('одна нода с маркой — её границы', () => {
    // <p>Hello world</p>: текст начинается с позиции 1
    const editor = makeEditorWithDoc([[{ text: 'Hello ' }, { text: 'world', threadId: 't1' }]]);
    expect(getThreadMarkRange(editor, 't1')).toEqual({ from: 7, to: 12 });
  });

  it('марка разбита на несколько text-нод (жирный внутри) — берёт весь диапазон', () => {
    const editor = makeEditorWithDoc([
      [
        { text: 'ab ' },
        { text: 'cd', threadId: 't1' },
        { text: 'ef', threadId: 't1', bold: true },
        { text: 'gh', threadId: 't1' },
        { text: ' end' },
      ],
    ]);
    // 'ab ' занимает 1..4, затем cd(4..6) ef(6..8) gh(8..10)
    expect(getThreadMarkRange(editor, 't1')).toEqual({ from: 4, to: 10 });
  });

  it('марка охватывает несколько абзацев', () => {
    const editor = makeEditorWithDoc([
      [{ text: 'first', threadId: 't1' }],
      [{ text: 'second', threadId: 't1' }],
    ]);
    // p1: открытие 0, текст 1..6, закрытие → p2 начинается с 7, текст 8..14
    expect(getThreadMarkRange(editor, 't1')).toEqual({ from: 1, to: 14 });
  });

  it('игнорирует марки других тредов', () => {
    const editor = makeEditorWithDoc([
      [
        { text: 'aa', threadId: 't1' },
        { text: 'bb', threadId: 't2' },
      ],
    ]);
    expect(getThreadMarkRange(editor, 't2')).toEqual({ from: 3, to: 5 });
  });

  it('марки нет (текст удалили) — null', () => {
    const editor = makeEditorWithDoc([[{ text: 'plain' }]]);
    expect(getThreadMarkRange(editor, 't1')).toBeNull();
  });

  it('другая марка с тем же threadId не считается комментарием', () => {
    const editor = makeEditorWithDoc([[{ text: 'bold', bold: true }]]);
    expect(getThreadMarkRange(editor, 't1')).toBeNull();
  });
});

describe('createCommentThreadAt', () => {
  it('ставит марку на диапазон и записывает тред и первое сообщение', () => {
    const { threadsMap, messagesMap } = makeMaps();
    const { editor, chain } = makeCommandEditor();
    const range = { from: 3, to: 9 };

    const thread = createCommentThreadAt(editor, threadsMap, messagesMap, range, 'Привет', author);

    expect(chain.setTextSelection).toHaveBeenCalledWith(range);
    expect(chain.setComment).toHaveBeenCalledWith(thread.id, 'color-u1');
    expect(chain.run).toHaveBeenCalledTimes(1);

    expect(thread).toMatchObject({
      resolved: false,
      authorId: 'u1',
      authorName: 'Анна',
    });
    expect(threadsMap.get(thread.id)).toEqual(thread);

    const messages = getThreadMessages(messagesMap, thread.id);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ text: 'Привет', authorId: 'u1', threadId: thread.id });
  });

  it('каждый вызов создаёт новый тред', () => {
    const { threadsMap, messagesMap } = makeMaps();
    const { editor } = makeCommandEditor();
    const a = createCommentThreadAt(
      editor,
      threadsMap,
      messagesMap,
      { from: 1, to: 2 },
      'a',
      author,
    );
    const b = createCommentThreadAt(
      editor,
      threadsMap,
      messagesMap,
      { from: 3, to: 4 },
      'b',
      author,
    );
    expect(a.id).not.toBe(b.id);
    expect(threadsMap.size).toBe(2);
  });
});

describe('addCommentReply', () => {
  it('добавляет сообщение в тред', () => {
    const { messagesMap } = makeMaps();
    addCommentReply(messagesMap, 't1', 'ответ', { authorId: 'u2', authorName: 'Борис' });

    const [m] = getThreadMessages(messagesMap, 't1');
    expect(m).toMatchObject({ text: 'ответ', authorId: 'u2', authorName: 'Борис', threadId: 't1' });
  });

  it('ответы идут в порядке создания', () => {
    vi.useFakeTimers();
    try {
      const { messagesMap } = makeMaps();
      vi.setSystemTime(1000);
      addCommentReply(messagesMap, 't1', 'первый', author);
      vi.setSystemTime(2000);
      addCommentReply(messagesMap, 't1', 'второй', author);
      expect(getThreadMessages(messagesMap, 't1').map((m) => m.text)).toEqual(['первый', 'второй']);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('setCommentThreadResolved', () => {
  it('меняет resolved и сохраняет остальные поля', () => {
    const { threadsMap } = makeMaps();
    threadsMap.set('t1', makeThread('t1'));

    setCommentThreadResolved(threadsMap, 't1', true);
    expect(threadsMap.get('t1')).toEqual(makeThread('t1', { resolved: true }));

    setCommentThreadResolved(threadsMap, 't1', false);
    expect(threadsMap.get('t1')?.resolved).toBe(false);
  });

  it('несуществующий тред — ничего не создаёт', () => {
    const { threadsMap } = makeMaps();
    setCommentThreadResolved(threadsMap, 'nope', true);
    expect(threadsMap.size).toBe(0);
  });
});

describe('deleteCommentThread', () => {
  it('снимает марку, удаляет тред и все его сообщения, чужие не трогает', () => {
    const { threadsMap, messagesMap } = makeMaps();
    const { editor, unsetComment } = makeCommandEditor();
    threadsMap.set('t1', makeThread('t1'));
    threadsMap.set('t2', makeThread('t2'));
    messagesMap.set('m1', makeMessage('m1', 't1', 1));
    messagesMap.set('m2', makeMessage('m2', 't1', 2));
    messagesMap.set('m3', makeMessage('m3', 't2', 3));

    deleteCommentThread(editor, threadsMap, messagesMap, 't1');

    expect(unsetComment).toHaveBeenCalledWith('t1');
    expect(threadsMap.has('t1')).toBe(false);
    expect(threadsMap.has('t2')).toBe(true);
    expect([...messagesMap.keys()]).toEqual(['m3']);
  });
});

describe('deleteCommentMessage', () => {
  let maps: ReturnType<typeof makeMaps>;
  let cmd: ReturnType<typeof makeCommandEditor>;

  beforeEach(() => {
    maps = makeMaps();
    cmd = makeCommandEditor();
    maps.threadsMap.set('t1', makeThread('t1'));
  });

  it('не последнее сообщение — удаляется только оно, тред и марка остаются', () => {
    maps.messagesMap.set('m1', makeMessage('m1', 't1', 1));
    maps.messagesMap.set('m2', makeMessage('m2', 't1', 2));

    deleteCommentMessage(cmd.editor, maps.threadsMap, maps.messagesMap, 't1', 'm1');

    expect(maps.messagesMap.has('m1')).toBe(false);
    expect(maps.messagesMap.has('m2')).toBe(true);
    expect(maps.threadsMap.has('t1')).toBe(true);
    expect(cmd.unsetComment).not.toHaveBeenCalled();
  });

  it('последнее сообщение — удаляется и тред, и марка', () => {
    maps.messagesMap.set('m1', makeMessage('m1', 't1', 1));

    deleteCommentMessage(cmd.editor, maps.threadsMap, maps.messagesMap, 't1', 'm1');

    expect(maps.messagesMap.size).toBe(0);
    expect(maps.threadsMap.has('t1')).toBe(false);
    expect(cmd.unsetComment).toHaveBeenCalledWith('t1');
  });
});
