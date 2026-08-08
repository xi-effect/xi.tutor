import { ERASER_CATEGORIES } from '../config';

export const areAllEraserCategoriesEnabled = (settings: Record<string, boolean>) => {
  return ERASER_CATEGORIES.every(({ key }) => settings[key]);
};
