import { useCallback } from 'react';
import { Button } from '@xipkg/button';
import { useDrawStyles } from '../../hooks';
import { useDrawStore } from '../../store';
import { useXiGeoStyles } from './useXiGeoStyles';
import { TFill } from '../../types';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';

export const FillTypePicker = () => {
  const { t } = useTranslation('board');
  const { setGeoFillType } = useDrawStore();
  const { setSelectedShapesFillType } = useDrawStyles();
  const {
    bgCurrentColorClass,
    bgCurrentColorCss,
    borderCurrentColorClass,
    borderCurrentColorCss,
    currentFillType,
  } = useXiGeoStyles();

  const handleFillType = useCallback(
    (fillType: TFill) => {
      setSelectedShapesFillType(fillType);
      setGeoFillType(fillType);
    },
    [setGeoFillType, setSelectedShapesFillType],
  );

  const fillPreview = (opacity?: number) => (
    <div className="border-border-default h-5 w-5 overflow-hidden rounded-full border-2">
      <div
        className={cn('h-full w-full', !bgCurrentColorCss && bgCurrentColorClass)}
        style={{
          backgroundColor: bgCurrentColorCss,
          opacity,
        }}
      />
    </div>
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
        title={t('geo.noFill')}
      >
        <div
          className={cn(
            'border-border-default h-5 w-5 rounded-full border-2',
            !borderCurrentColorCss && borderCurrentColorClass,
          )}
          style={{
            borderColor: borderCurrentColorCss,
            backgroundImage: 'repeating-conic-gradient(rgba(0,0,0,0.3) 0% 25%, transparent 0% 50%)',
            backgroundSize: '10px 10px',
          }}
        />
      </Button>
      <Button
        variant="none"
        size="s"
        className={cn(
          currentFillType === 'semi' ? 'bg-background-subtle' : 'bg-transparent!',
          'hover:bg-status-info-background p-1',
        )}
        onClick={() => handleFillType('semi')}
        title={t('geo.semiTransparent')}
      >
        {fillPreview(0.25)}
      </Button>
      <Button
        variant="none"
        size="s"
        className={cn(
          currentFillType === 'solid' ? 'bg-background-subtle' : 'bg-transparent!',
          'hover:bg-status-info-background p-1',
        )}
        onClick={() => handleFillType('solid')}
        title={t('geo.solid')}
      >
        {fillPreview()}
      </Button>
    </div>
  );
};
