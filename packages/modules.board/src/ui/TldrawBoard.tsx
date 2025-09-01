import { YjsProvider } from '../providers/YjsProvider';
import { TldrawCanvas } from './components';

export const TldrawBoard = () => {
  return (
    <YjsProvider>
      <TldrawCanvas />
    </YjsProvider>
  );
};
