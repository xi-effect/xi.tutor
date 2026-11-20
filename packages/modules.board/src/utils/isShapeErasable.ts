import { isEraserTypeEnabled, useEraserSettingsStore } from '../store';

export const isShapeErasable = (shapeType: string) => {
  return isEraserTypeEnabled(useEraserSettingsStore.getState().settings, shapeType);
};
