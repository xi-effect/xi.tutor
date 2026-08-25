import { useCallback, useState } from 'react';
import { track, useEditor } from '@ibodr/draw';
import { Checkbox } from '@xipkg/checkbox';
import { Picker } from '../../ui/components/popups/Picker';
import type { MathFigureShape } from './MathFigureShape';
import {
  kindHasHeight,
  kindHasHiddenEdges,
  kindHasMedian,
  kindHasBisector,
  isSolidMathFigureKind,
  isChemFigureKind,
} from './utils/kinds';
import { useTranslation } from 'react-i18next';

export const MathFigureSettingsPicker = track(function MathFigureSettingsPicker() {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const [open, setOpen] = useState(false);

  const selectedShapes = editor.getSelectedShapes();
  const shape =
    selectedShapes.length === 1 && selectedShapes[0].type === 'math-figure'
      ? (selectedShapes[0] as MathFigureShape)
      : null;

  const updateProps = useCallback(
    (props: Partial<MathFigureShape['props']>) => {
      if (!shape) return;
      editor.updateShape({
        id: shape.id,
        type: 'math-figure',
        props,
      });
    },
    [editor, shape],
  );

  if (!shape) return null;

  const showHiddenToggle = kindHasHiddenEdges(shape.props.kind);
  const showHeightToggle = kindHasHeight(shape.props.kind);
  const showMedianToggle = kindHasMedian(shape.props.kind);
  const showBisectorToggle = kindHasBisector(shape.props.kind);

  return (
    <Picker
      open={open}
      setOpen={setOpen}
      triggerTitle={t('mathFigure.settings')}
      triggerChild={
        <span className="text-text-link px-1 text-xs font-semibold tracking-tight">
          {isSolidMathFigureKind(shape.props.kind)
            ? '3D'
            : isChemFigureKind(shape.props.kind)
              ? t('mathFigure.chemShort')
              : '2D'}
        </span>
      }
      popoverChild={
        <div className="flex w-[240px] flex-col gap-3">
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="text-text-primary text-sm">{t('mathFigure.labels')}</span>
            <Checkbox
              checked={shape.props.showLabels}
              onCheckedChange={(checked) => updateProps({ showLabels: checked === true })}
            />
          </label>
          {showHiddenToggle && (
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-text-primary text-sm">{t('mathFigure.hiddenEdges')}</span>
              <Checkbox
                checked={shape.props.showHiddenEdges}
                onCheckedChange={(checked) => updateProps({ showHiddenEdges: checked === true })}
              />
            </label>
          )}
          {showHeightToggle && (
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-text-primary text-sm">{t('mathFigure.height')}</span>
              <Checkbox
                checked={shape.props.showHeight}
                onCheckedChange={(checked) => updateProps({ showHeight: checked === true })}
              />
            </label>
          )}
          {showMedianToggle && (
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-text-primary text-sm">{t('mathFigure.median')}</span>
              <Checkbox
                checked={shape.props.showMedian}
                onCheckedChange={(checked) => updateProps({ showMedian: checked === true })}
              />
            </label>
          )}
          {showBisectorToggle && (
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-text-primary text-sm">{t('mathFigure.bisector')}</span>
              <Checkbox
                checked={shape.props.showBisector}
                onCheckedChange={(checked) => updateProps({ showBisector: checked === true })}
              />
            </label>
          )}
        </div>
      }
    />
  );
});
