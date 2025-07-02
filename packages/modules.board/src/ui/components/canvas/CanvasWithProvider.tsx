import React from 'react';
import { Canvas } from './Canvas';
import { StageProvider } from '../../../providers';

interface CanvasWithProviderProps {
  className?: string;
  style?: React.CSSProperties;
}

export const CanvasWithProvider: React.FC<CanvasWithProviderProps> = ({ className, style }) => {
  return (
    <div className={className} style={style}>
      <StageProvider>
        <Canvas />
      </StageProvider>
    </div>
  );
};
