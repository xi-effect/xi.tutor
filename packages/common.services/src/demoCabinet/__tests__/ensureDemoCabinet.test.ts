import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEMO_CABINET_NAMES, DEMO_CABINET_TEMPLATE_VERSION } from '../template';
import { readCreatedId } from '../ids';
import { demoCabinetStorageKey, writeDemoCabinetProgress } from '../progress';
import { ensureDemoCabinet, resetDemoCabinetInflightForTests } from '../ensureDemoCabinet';
import { buildDemoNoteDocument } from '../template';
import type { DemoCabinetPorts, DemoCabinetStorage } from '../types';

const memoryStorage = (): DemoCabinetStorage => {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value);
    },
  };
};

const portsWith = (storage: DemoCabinetStorage, overrides: Partial<DemoCabinetPorts> = {}) => {
  const createClassroom = vi.fn(async () => 'classroom-1');
  const createBoard = vi.fn(async () => 'board-1');
  const createNote = vi.fn(async () => 'note-1');
  const seedBoard = vi.fn(async () => undefined);
  const seedNote = vi.fn(async () => undefined);
  const markInitialized = vi.fn(async () => undefined);
  const ports: DemoCabinetPorts = {
    storage,
    readInitialized: async () => false,
    markInitialized,
    classroomExists: async () => true,
    materialExists: async () => true,
    createClassroom,
    createBoard,
    createNote,
    seedBoard,
    seedNote,
    canCreateClassroom: () => true,
    refresh: () => undefined,
    ...overrides,
  };

  return { ports, createClassroom, createBoard, createNote, seedBoard, seedNote, markInitialized };
};

describe('демонстрационный кабинет', () => {
  beforeEach(() => {
    resetDemoCabinetInflightForTests();
  });

  it('читает идентификатор из тела ответа и из обёртки data', () => {
    expect(readCreatedId({ id: 17 })).toBe('17');
    expect(readCreatedId({ data: { id: 'board-1' } })).toBe('board-1');
    expect(() => readCreatedId({ name: 'пусто' })).toThrow('missing-id');
  });

  it('кладёт в заметку поддерживаемые блоки и ссылку на доску', () => {
    const document = buildDemoNoteDocument('https://sovlium.ru/classrooms/1/boards/2');
    const serialized = JSON.stringify(document);

    expect(serialized).toContain(DEMO_CABINET_NAMES.note);
    expect(serialized).toContain('"type":"heading"');
    expect(serialized).toContain('"type":"bulletList"');
    expect(serialized).toContain('"type":"orderedList"');
    expect(serialized).toContain('"type":"taskList"');
    expect(serialized).toContain('"type":"blockquote"');
    expect(serialized).toContain('"type":"codeBlock"');
    expect(serialized).toContain('https://sovlium.ru/classrooms/1/boards/2');
    expect(serialized).not.toContain('lorem');
  });

  it('создаёт кабинет, доску и заметку один раз и сохраняет результат', async () => {
    const storage = memoryStorage();
    const setup = portsWith(storage);

    const first = await ensureDemoCabinet(4, setup.ports);
    const second = await ensureDemoCabinet(4, setup.ports);

    expect(first).toEqual({
      status: 'ready',
      classroomId: 'classroom-1',
      boardId: 'board-1',
      noteId: 'note-1',
    });
    expect(second).toEqual(first);
    expect(setup.createClassroom).toHaveBeenCalledTimes(1);
    expect(setup.createBoard).toHaveBeenCalledTimes(1);
    expect(setup.createNote).toHaveBeenCalledTimes(1);
    expect(setup.seedBoard).toHaveBeenCalledTimes(1);
    expect(setup.seedNote).toHaveBeenCalledWith({
      classroomId: 'classroom-1',
      noteId: 'note-1',
      boardId: 'board-1',
    });
    expect(setup.markInitialized).toHaveBeenCalledTimes(2);
    expect(storage.getItem(demoCabinetStorageKey(4))).toContain(
      `"templateVersion":${DEMO_CABINET_TEMPLATE_VERSION}`,
    );
  });

  it('параллельные вызовы делят одну операцию', async () => {
    const storage = memoryStorage();
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const createClassroom = vi.fn(async () => {
      await gate;
      return 'classroom-1';
    });
    const setup = portsWith(storage, { createClassroom });

    const first = ensureDemoCabinet(8, setup.ports);
    const second = ensureDemoCabinet(8, setup.ports);
    expect(second).toBe(first);
    release();
    await first;
    expect(createClassroom).toHaveBeenCalledTimes(1);
  });

  it('после сбоя доски повторный запрос не создаёт кабинет заново', async () => {
    const storage = memoryStorage();
    let boardAttempts = 0;
    const createBoard = vi.fn(async () => {
      boardAttempts += 1;
      if (boardAttempts === 1) throw new Error('board-down');
      return 'board-1';
    });
    const setup = portsWith(storage, { createBoard });

    await expect(ensureDemoCabinet(3, setup.ports)).rejects.toThrow('board-down');
    const result = await ensureDemoCabinet(3, setup.ports);

    expect(result.status).toBe('ready');
    expect(setup.createClassroom).toHaveBeenCalledTimes(1);
    expect(createBoard).toHaveBeenCalledTimes(2);
    expect(setup.createNote).toHaveBeenCalledTimes(1);
  });

  it('досеивает заметку, если сущности уже созданы', async () => {
    const storage = memoryStorage();
    writeDemoCabinetProgress(storage, 5, {
      templateVersion: DEMO_CABINET_TEMPLATE_VERSION,
      phase: 'in_progress',
      classroomId: 'classroom-1',
      boardId: 'board-1',
      noteId: 'note-1',
      boardSettled: true,
      noteSettled: false,
    });
    const setup = portsWith(storage);

    await ensureDemoCabinet(5, setup.ports);

    expect(setup.createClassroom).not.toHaveBeenCalled();
    expect(setup.createBoard).not.toHaveBeenCalled();
    expect(setup.createNote).not.toHaveBeenCalled();
    expect(setup.seedBoard).not.toHaveBeenCalled();
    expect(setup.seedNote).toHaveBeenCalledTimes(1);
  });

  it('не восстанавливает удалённый кабинет', async () => {
    const storage = memoryStorage();
    writeDemoCabinetProgress(storage, 6, {
      templateVersion: DEMO_CABINET_TEMPLATE_VERSION,
      phase: 'in_progress',
      classroomId: 'classroom-1',
      boardId: null,
      noteId: null,
      boardSettled: false,
      noteSettled: false,
    });
    const setup = portsWith(storage, {
      classroomExists: async () => false,
    });

    const result = await ensureDemoCabinet(6, setup.ports);

    expect(result).toEqual({ status: 'removed' });
    expect(setup.createClassroom).not.toHaveBeenCalled();
    expect(setup.createBoard).not.toHaveBeenCalled();
    expect(setup.markInitialized).toHaveBeenCalledTimes(1);
  });

  it('не создаёт доску повторно, если пользователь её удалил', async () => {
    const storage = memoryStorage();
    writeDemoCabinetProgress(storage, 9, {
      templateVersion: DEMO_CABINET_TEMPLATE_VERSION,
      phase: 'in_progress',
      classroomId: 'classroom-1',
      boardId: 'board-1',
      noteId: null,
      boardSettled: false,
      noteSettled: false,
    });
    const setup = portsWith(storage, {
      materialExists: async (_classroomId, materialId) => materialId !== 'board-1',
    });

    const result = await ensureDemoCabinet(9, setup.ports);

    expect(result).toMatchObject({ status: 'ready', boardId: null, noteId: 'note-1' });
    expect(setup.createBoard).not.toHaveBeenCalled();
    expect(setup.seedBoard).not.toHaveBeenCalled();
    expect(setup.createNote).toHaveBeenCalledTimes(1);
  });

  it('не создаёт ничего, если инициализация уже отмечена', async () => {
    const storage = memoryStorage();
    const setup = portsWith(storage, {
      readInitialized: async () => true,
    });

    const result = await ensureDemoCabinet(2, setup.ports);

    expect(result).toEqual({
      status: 'ready',
      classroomId: null,
      boardId: null,
      noteId: null,
    });
    expect(setup.createClassroom).not.toHaveBeenCalled();
    expect(setup.markInitialized).not.toHaveBeenCalled();
  });

  it('не начинает создание, когда лимит кабинетов закрыт', async () => {
    const storage = memoryStorage();
    const setup = portsWith(storage, {
      canCreateClassroom: () => false,
    });

    await expect(ensureDemoCabinet(11, setup.ports)).rejects.toThrow('classroom-limit');
    expect(setup.createClassroom).not.toHaveBeenCalled();
    expect(storage.getItem(demoCabinetStorageKey(11))).toBeNull();
  });
});
