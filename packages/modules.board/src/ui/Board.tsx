import { Canvas } from './components/canvas';
import { StageProvider } from '../providers';
import { usePerformanceTracking } from '../hooks';

export const Board = () => {
  const { trackComponentRender } = usePerformanceTracking();
  trackComponentRender('Board', () => {});

  return (
    <StageProvider>
      <Canvas />
    </StageProvider>
  );
};
