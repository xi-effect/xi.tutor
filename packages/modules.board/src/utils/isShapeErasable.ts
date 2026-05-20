import { useEraserSettingsStore } from '../store';
import { ERASER_CATEGORIES } from '../ui/components/config';

export const isShapeErasable = (shapeType: string) => {
  const settings = useEraserSettingsStore.getState().settings;

  const category = ERASER_CATEGORIES.find((item) => item.types.includes(shapeType));

  if (!category) {
    return true;
  }

  return settings[category.key];
};
