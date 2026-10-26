import { useRef, useState } from 'react';
import { cloneHomeworkContent, emptyHomeworkContent, type HomeworkDraft } from 'modules.homework';
import { readHomeworkLibrary, writeHomeworkLibrary } from '../storage';
import type { HomeworkItem } from '../types';

const copySuffix = ' (копия)';

const withCopySuffix = (title: string) => {
  const maxBase = Math.max(1, 100 - copySuffix.length);
  return `${title.trim().slice(0, maxBase).trim()}${copySuffix}`;
};

const nowIso = () => new Date().toISOString();

const questionCountFor = (content: HomeworkItem['content'], fallback: number) =>
  content.questions.length > 0 ? content.questions.length : fallback;

export const useHomeworkLibrary = () => {
  const [items, setItems] = useState<HomeworkItem[]>(() => readHomeworkLibrary());
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const commit = (updater: (current: HomeworkItem[]) => HomeworkItem[]) => {
    const next = updater(itemsRef.current);
    itemsRef.current = next;
    writeHomeworkLibrary(next);
    setItems(next);
    return next;
  };

  const updateItem = (id: string, patch: Partial<HomeworkItem>) => {
    commit((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch, updatedAt: nowIso() } : item)),
    );
  };

  const saveDraft = (id: string, draft: HomeworkDraft, questionsChanged: boolean) => {
    commit((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          title: draft.title,
          description: draft.description,
          content: draft.content,
          questionCount: questionsChanged ? draft.content.questions.length : item.questionCount,
          updatedAt: nowIso(),
        };
      }),
    );
  };

  const createAssignment = (title: string, description: string) => {
    const timestamp = nowIso();
    const next: HomeworkItem = {
      id: crypto.randomUUID(),
      kind: 'assignment',
      feed: 'active',
      originFeed: 'active',
      title,
      description,
      students: [],
      dueAt: null,
      questionCount: 0,
      content: emptyHomeworkContent(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    commit((current) => [next, ...current]);
    return next.id;
  };

  const duplicateItem = (id: string) => {
    commit((current) => {
      const source = current.find((item) => item.id === id);
      if (!source) return current;

      const timestamp = nowIso();
      const content = cloneHomeworkContent(source.content);
      const copy: HomeworkItem = {
        ...source,
        id: crypto.randomUUID(),
        title: withCopySuffix(source.title),
        students: source.students.map((student) => ({ ...student, id: crypto.randomUUID() })),
        content,
        questionCount: questionCountFor(content, source.questionCount),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      return [copy, ...current];
    });
  };

  const archiveItem = (id: string) => {
    commit((current) =>
      current.map((item) => {
        if (item.id !== id || item.feed === 'archive') return item;
        return {
          ...item,
          originFeed: item.feed === 'templates' ? 'templates' : 'active',
          feed: 'archive' as const,
          updatedAt: nowIso(),
        };
      }),
    );
  };

  const restoreItem = (id: string) => {
    commit((current) =>
      current.map((item) => {
        if (item.id !== id || item.feed !== 'archive') return item;
        return {
          ...item,
          feed: item.originFeed,
          updatedAt: nowIso(),
        };
      }),
    );
  };

  const createFromTemplate = (id: string) => {
    let createdId: string | null = null;
    commit((current) => {
      const template = current.find((item) => item.id === id && item.kind === 'template');
      if (!template) return current;

      const timestamp = nowIso();
      const content = cloneHomeworkContent(template.content);
      const assignment: HomeworkItem = {
        id: crypto.randomUUID(),
        kind: 'assignment',
        feed: 'active',
        originFeed: 'active',
        title: template.title,
        description: template.description,
        students: [],
        dueAt: null,
        questionCount: questionCountFor(content, template.questionCount),
        content,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      createdId = assignment.id;
      return [assignment, ...current];
    });
    return createdId;
  };

  return {
    items,
    updateItem,
    saveDraft,
    createAssignment,
    duplicateItem,
    archiveItem,
    restoreItem,
    createFromTemplate,
  };
};
