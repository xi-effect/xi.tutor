export type StrokePointT = { x: number; y: number }; // относительно контента

export type StrokeT = {
  id: string;
  color: string;
  size: number;
  mode: 'draw' | 'erase';
  points: StrokePointT[];
  opacity: number;
};

export type DrawToolT = {
  mode: 'draw' | 'erase';
  color: string;
  size: number;
  opacity: number;
};

// Для картинки: annotations: StrokeT[] (один слой на изображение).
// Для PDF: annotations: Record<number, StrokeT[]> (свой слой на каждую страницу, ключ — номер страницы).
