import { StageProvider } from '../providers';
import { Canvas } from './components/Canvas';

export const Board = () => (
  <StageProvider>
    <Canvas />
  </StageProvider>
);
