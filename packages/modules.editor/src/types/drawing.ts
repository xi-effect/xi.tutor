export type StrokePointT = { x: number; y: number }; // относительно контента

export type StrokeT = {
  id: string;
  color: string;
  size: number; // относительная толщина (доля от ширины канваса)
  mode: 'draw' | 'erase';
  points: StrokePointT[];
};

export type DrawToolT = {
  mode: 'draw' | 'erase';
  color: string;
  size: number;
};

// Для картинки: annotations: StrokeT[] (один слой на изображение).
// Для PDF: annotations: Record<number, StrokeT[]> (свой слой на каждую страницу, ключ — номер страницы).
