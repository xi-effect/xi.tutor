import type { DrRecord } from '@ibodr/draw';

export const DEMO_BOARD_ARCHIVE_ROOT = '/demo-board';

export type DemoBoardArchiveFile = {
  src?: string;
  path?: string;
};

export type DemoBoardCamera = {
  x: number;
  y: number;
  z: number;
};

type ArchiveRecord = DrRecord & {
  typeName?: string;
  x?: number;
  y?: number;
  z?: number;
};

export const publicDemoBoardSrc = (file: DemoBoardArchiveFile): string | null => {
  if (!file.src || !file.path) return null;
  const path = file.path.replace(/^\/+/, '');
  return `${DEMO_BOARD_ARCHIVE_ROOT}/${path}`;
};

export const demoBoardSrcMap = (files: readonly DemoBoardArchiveFile[]): Map<string, string> => {
  const map = new Map<string, string>();
  for (const file of files) {
    const next = publicDemoBoardSrc(file);
    if (file.src && next) map.set(file.src, next);
  }
  return map;
};

export const rewriteDemoBoardSrcs = <T>(value: T, srcToPublic: ReadonlyMap<string, string>): T => {
  if (typeof value === 'string') return (srcToPublic.get(value) ?? value) as T;
  if (Array.isArray(value)) {
    return value.map((item) => rewriteDemoBoardSrcs(item, srcToPublic)) as T;
  }
  if (value && typeof value === 'object') {
    const next: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      next[key] = rewriteDemoBoardSrcs(item, srcToPublic);
    }
    return next as T;
  }
  return value;
};

export const readArchiveCamera = (records: readonly ArchiveRecord[]): DemoBoardCamera | null => {
  const camera = records.find((record) => record.typeName === 'camera');
  if (!camera) return null;
  if (
    typeof camera.x !== 'number' ||
    typeof camera.y !== 'number' ||
    typeof camera.z !== 'number'
  ) {
    return null;
  }
  return { x: camera.x, y: camera.y, z: camera.z };
};

type BoardArchiveJson = {
  records?: unknown;
  byId?: Record<string, unknown>;
};

type FilesArchiveJson = {
  files?: DemoBoardArchiveFile[];
};

export const prepareDemoBoardArchive = (
  board: BoardArchiveJson,
  manifest: FilesArchiveJson,
): { records: DrRecord[]; camera: DemoBoardCamera | null } => {
  const raw = Array.isArray(board.records)
    ? board.records
    : board.byId
      ? Object.values(board.byId)
      : [];
  const records = rewriteDemoBoardSrcs(raw, demoBoardSrcMap(manifest.files ?? [])) as DrRecord[];
  return { records, camera: readArchiveCamera(records) };
};

export const loadDemoBoardArchive = async (): Promise<{
  records: DrRecord[];
  camera: DemoBoardCamera | null;
}> => {
  const [boardResponse, filesResponse] = await Promise.all([
    fetch(`${DEMO_BOARD_ARCHIVE_ROOT}/board.json`),
    fetch(`${DEMO_BOARD_ARCHIVE_ROOT}/files.json`),
  ]);
  if (!boardResponse.ok || !filesResponse.ok) {
    throw new Error('demo-board-archive');
  }
  const board = (await boardResponse.json()) as BoardArchiveJson;
  const manifest = (await filesResponse.json()) as FilesArchiveJson;
  return prepareDemoBoardArchive(board, manifest);
};
