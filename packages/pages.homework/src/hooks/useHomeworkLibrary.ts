import { useEffect, useState } from 'react';
import { readHomeworkLibrary, writeHomeworkLibrary } from '../storage';
import type { HomeworkItem } from '../types';

const copySuffix = ' (копия)';

const withCopySuffix = (title: string) => {
  const maxBase = Math.max(1, 100 - copySuffix.length);
  return `${title.trim().slice(0, maxBase).trim()}${copySuffix}`;
};

const nowIso = () => new Date().toISOString();

export const useHomeworkLibrary = () => {
  const [items, setItems] = useState<HomeworkItem[]>(() => readHomeworkLibrary());

  useEffect(() => {
    writeHomeworkLibrary(items);
  }, [items]);

  const updateItem = (id: string, patch: Partial<HomeworkItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch, updatedAt: nowIso() } : item)),
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
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    setItems((current) => [next, ...current]);
  };

  const duplicateItem = (id: string) => {
    setItems((current) => {
      const source = current.find((item) => item.id === id);
      if (!source) return current;

      const timestamp = nowIso();
      const copy: HomeworkItem = {
        ...source,
        id: crypto.randomUUID(),
        title: withCopySuffix(source.title),
        students: source.students.map((student) => ({ ...student, id: crypto.randomUUID() })),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      return [copy, ...current];
    });
  };

  const archiveItem = (id: string) => {
    setItems((current) =>
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
    setItems((current) =>
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
    setItems((current) => {
      const template = current.find((item) => item.id === id && item.kind === 'template');
      if (!template) return current;

      const timestamp = nowIso();
      const assignment: HomeworkItem = {
        id: crypto.randomUUID(),
        kind: 'assignment',
        feed: 'active',
        originFeed: 'active',
        title: template.title,
        description: template.description,
        students: [],
        dueAt: null,
        questionCount: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      return [assignment, ...current];
    });
  };

  return {
    items,
    updateItem,
    createAssignment,
    duplicateItem,
    archiveItem,
    restoreItem,
    createFromTemplate,
  };
};
