import { useHotkeys } from '../../../hooks';
import { memo } from 'react';

export const HotkeysHandler = memo(() => {
  useHotkeys();
  return null; // Этот компонент не рендерит ничего видимого
});
