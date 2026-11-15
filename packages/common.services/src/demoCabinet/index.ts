export { DemoCabinetError } from './errors';
export { ensureDemoCabinet, resetDemoCabinetInflightForTests } from './ensureDemoCabinet';
export { readCreatedId } from './ids';
export { readClassroomStorageItem } from './api';
export { browserDemoCabinetStorage, readDemoCabinetProgress } from './progress';
export {
  DEMO_CABINET_BOARD_COPY,
  DEMO_CABINET_FLAG_KEY,
  DEMO_CABINET_NAMES,
  DEMO_CABINET_NOTE_COPY,
  DEMO_CABINET_TEMPLATE_VERSION,
  DEMO_SAMPLE_PDF,
  isPublicAssetSrc,
  buildDemoNoteDocument,
} from './template';
export type { DemoNoteNode } from './template';
export type {
  DemoBoardSeedTarget,
  DemoCabinetPorts,
  DemoCabinetResult,
  DemoNoteSeedTarget,
} from './types';
