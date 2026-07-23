import { useCallback } from 'react';
import { Button } from '@xipkg/button';
import { useDrawStyles } from '../../hooks';
import { useDrawStore } from '../../store';
import { useXiGeoStyles } from './useXiGeoStyles';
import { TFill } from '../../types';
import { cn } from '@xipkg/utils';

export const FillTypePicker = () => {
  const { setGeoFillType } = useDrawStore();
  const { setSelectedShapesFillType } = useDrawStyles();
  const { bgCurrentColorClass, borderCurrentColorClass, currentFillType } = useXiGeoStyles();

  const handleFillType = useCallback(
    (fillType: TFill) => {
      setSelectedShapesFillType(fillType);
      setGeoFillType(fillType);
    },
    [setGeoFillType, setSelectedShapesFillType],
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button
        variant="none"
        size="s"
        className={cn(
          currentFillType === 'none' ? 'bg-background-subtle' : 'bg-transparent!',
          'hover:bg-status-info-background p-1',
        )}
        onClick={() => handleFillType('none')}
        title="Без заливки"
      >
        <div
          className={cn('h-5 w-5 rounded-full border-2', borderCurrentColorClass)}
          style={{
            backgroundImage: 'repeating-conic-gradient(rgba(0,0,0,0.3) 0% 25%, transparent 0% 50%)',
            backgroundSize: '10px 10px',
          }}
        />
      </Button>
      <Button
        variant="none"
        size="s"
        data-active={true}
        className={cn(
          currentFillType === 'semi' ? 'bg-background-subtle' : 'bg-transparent!',
          'hover:bg-status-info-background p-1',
        )}
        onClick={() => handleFillType('semi')}
        title="Полупрозрачная"
      >
        <div className={cn('h-5 w-5 rounded-full opacity-25', bgCurrentColorClass)} />
      </Button>
      <Button
        variant="none"
        size="s"
        className={cn(
          currentFillType === 'solid' ? 'bg-background-subtle' : 'bg-transparent!',
          'hover:bg-status-info-background p-1',
        )}
        onClick={() => handleFillType('solid')}
        title="Сплошная"
      >
        <div className={cn('h-5 w-5 rounded-full', bgCurrentColorClass)} />
      </Button>
    </div>
  );
};
