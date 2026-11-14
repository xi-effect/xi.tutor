export type DemoCabinetPhase = 'in_progress' | 'ready' | 'removed';

export type DemoCabinetProgress = {
  templateVersion: number;
  phase: DemoCabinetPhase;
  classroomId: string | null;
  boardId: string | null;
  noteId: string | null;
  boardSettled: boolean;
  noteSettled: boolean;
};

export type DemoCabinetStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export type DemoCabinetResult =
  | {
      status: 'ready';
      classroomId: string | null;
      boardId: string | null;
      noteId: string | null;
    }
  | { status: 'removed' };

export type DemoBoardSeedTarget = {
  classroomId: string;
  boardId: string;
};

export type DemoNoteSeedTarget = {
  classroomId: string;
  noteId: string;
  boardId: string | null;
};

export type DemoCabinetPorts = {
  storage?: DemoCabinetStorage;
  readInitialized?: () => Promise<boolean>;
  markInitialized?: () => Promise<void>;
  classroomExists?: (classroomId: string) => Promise<boolean>;
  materialExists?: (classroomId: string, materialId: string) => Promise<boolean>;
  createClassroom?: () => Promise<string>;
  createBoard?: (classroomId: string) => Promise<string>;
  createNote?: (classroomId: string) => Promise<string>;
  seedBoard: (target: DemoBoardSeedTarget) => Promise<void>;
  seedNote: (target: DemoNoteSeedTarget) => Promise<void>;
  canCreateClassroom?: () => boolean;
  refresh?: (classroomId: string) => void;
};
