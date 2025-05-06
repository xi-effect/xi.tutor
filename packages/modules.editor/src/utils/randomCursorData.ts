import { nanoid } from 'nanoid';

/**
 * Generate random cursor data for collaborative editing
 */
export const randomCursorData = () => {
  // Random pastel colors for cursor
  const hue = Math.floor(Math.random() * 360);
  const color = `hsl(${hue}, 75%, 75%)`;

  return {
    id: nanoid(),
    name: `User-${nanoid(4)}`,
    color,
    avatarUrl: '',
  };
};
