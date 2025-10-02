import { useHotkeys } from '../../../hooks';
import { memo } from 'react';

export const HotkeysHandler = memo(() => {
  console.log('HotkeysHandler: rendering');
  useHotkeys();
  return null; // Этот компонент не рендерит ничего видимого
});
