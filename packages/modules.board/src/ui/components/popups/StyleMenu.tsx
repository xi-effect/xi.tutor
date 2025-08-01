import { useState } from 'react';
import { Slider } from '@xipkg/slider';
import { ColorGrid } from './ColorSet';
import { useTldrawStyles } from '../../../hooks/useTldrawStyles';

const sizes = ['s', 'm', 'l', 'xl'] as const;

export const StyleMenu = () => {
  const [currentSize, setCurrentSize] = useState<string>('m');
  const [currentOpacity, setCurrentOpacity] = useState<number>(100);

  const { setThickness, setOpacity } = useTldrawStyles();

  const handleSize = (value: number[]) => {
    const size = sizes[value[0] - 1];
    setCurrentSize(size);
    setThickness(size);
  };

  const handleOpacity = (value: number[]) => {
    const opacity = value[0];
    setCurrentOpacity(opacity);
    setOpacity(opacity);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-2 md:flex-row">
      <div className="w-[276px] p-2">
        <div className="flex w-full flex-col justify-center gap-6">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="w-full">
              <Slider
                onValueChange={(value) => handleSize(value)}
                defaultValue={[2]}
                min={1}
                max={4}
                step={1}
                minStepsBetweenThumbs={1}
              />
            </div>
            <div className="w-8">
              <p>{currentSize.toUpperCase()}</p>
            </div>
          </div>
          <div className="flex w-full items-center justify-between gap-4">
            <div className="w-full">
              <Slider
                onValueChange={(value) => handleOpacity(value)}
                defaultValue={[100]}
                min={10}
                max={100}
                step={1}
              />
            </div>
            <div className="w-8">
              <p>{currentOpacity}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[276px] p-2">
        <ColorGrid />
      </div>
    </div>
  );
};
