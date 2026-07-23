import { useCallback, useEffect, useRef, useState, type SetStateAction } from 'react';
import { track, useEditor } from '@ibodr/draw';
import { Input } from '@xipkg/input';
import { Slider } from '@xipkg/slider';
import { Checkbox } from '@xipkg/checkbox';
import { Picker, ColorDot } from '../../ui/components';
import { colorOptions } from '../../utils/customConfig';
import type { CoordinateAxesShape } from './CoordinateAxesShape';
import type { TColor } from '../../types';
import { commitEquationForShape } from './utils/commitEquationForShape';

function isEquationDirty(shape: CoordinateAxesShape, draft: string): boolean {
  return draft.trim() !== shape.props.equation.trim();
}

/** Не затирать сохранённое уравнение пустым черновиком (гонка mount/unmount, blur при размонтировании). */
function shouldCommitEquationDraft(shape: CoordinateAxesShape, draft: string): boolean {
  if (!isEquationDirty(shape, draft)) return false;
  if (!draft.trim() && shape.props.equation.trim()) return false;
  return true;
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const [local, setLocal] = useState(String(value));

  useEffect(() => {
    setLocal(String(value));
  }, [value]);

  return (
    <label className="flex flex-col gap-1">
      <span className="text-text-secondary text-xs">{label}</span>
      <Input
        value={local}
        onChange={(e) => {
          setLocal(e.target.value);
          const parsed = Number(e.target.value);
          if (!Number.isNaN(parsed)) {
            onChange(parsed);
          }
        }}
        className="h-8"
      />
    </label>
  );
}

export const CoordinateAxesSettingsPicker = track(function CoordinateAxesSettingsPicker() {
  const editor = useEditor();
  const [open, setOpen] = useState(false);

  const selectedShapes = editor.getSelectedShapes();
  const shape =
    selectedShapes.length === 1 && selectedShapes[0].type === 'coordinate-axes'
      ? (selectedShapes[0] as CoordinateAxesShape)
      : null;

  const [equationDraft, setEquationDraft] = useState(() => shape?.props.equation ?? '');
  const [equationError, setEquationError] = useState<string | null>(null);

  const equationDraftRef = useRef(equationDraft);
  equationDraftRef.current = equationDraft;

  useEffect(() => {
    if (!shape) return;
    setEquationDraft(shape.props.equation);
    setEquationError(null);
  }, [shape?.id]);

  const updateProps = useCallback(
    (props: Partial<CoordinateAxesShape['props']>) => {
      if (!shape) return;
      editor.updateShape({
        id: shape.id,
        type: 'coordinate-axes',
        props,
      });
    },
    [editor, shape],
  );

  const commitEquation = useCallback(() => {
    if (!shape) return;

    const draft = equationDraftRef.current;
    if (!shouldCommitEquationDraft(shape, draft)) return;

    const result = commitEquationForShape(editor, shape.id, draft);
    if (!result.ok) {
      setEquationError(result.error);
      return;
    }

    setEquationError(null);
  }, [editor, shape]);

  const handleOpenChange = useCallback(
    (value: SetStateAction<boolean>) => {
      const nextOpen = typeof value === 'function' ? value(open) : value;
      if (nextOpen && shape) {
        setEquationDraft(shape.props.equation);
        setEquationError(null);
      }
      if (!nextOpen && open) {
        commitEquation();
      }
      setOpen(nextOpen);
    },
    [open, commitEquation, shape],
  );

  // Сохранить черновик при снятии выделения
  useEffect(() => {
    if (!shape) return;

    const shapeId = shape.id;

    return () => {
      const current = editor.getShape(shapeId);
      if (!current || !editor.isShapeOfType(current, 'coordinate-axes')) return;

      const draft = equationDraftRef.current;
      if (!shouldCommitEquationDraft(current, draft)) return;

      commitEquationForShape(editor, shapeId, draft);
    };
  }, [editor, shape?.id]);

  if (!shape) return null;

  return (
    <Picker
      open={open}
      setOpen={handleOpenChange}
      triggerTitle="Настройки осей"
      triggerChild={
        <span
          data-coordinate-axes-trigger
          className="text-text-link px-1 text-xs font-semibold tracking-tight"
        >
          f(x)
        </span>
      }
      popoverChild={
        <div data-coordinate-axes-popover className="flex w-[280px] flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-text-primary text-sm font-medium">Уравнение y =</span>
            <Input
              value={equationDraft}
              onChange={(e) => {
                setEquationDraft(e.target.value);
                setEquationError(null);
              }}
              onBlur={commitEquation}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitEquation();
                }
              }}
              placeholder="sin(x), x^2, 2*x+1"
              className="h-9"
            />
            {equationError && <span className="text-text-danger text-xs">{equationError}</span>}
            <span className="text-text-secondary text-xs">
              sin, cos, tan, sqrt, abs, ln, log, exp, pi, e
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-text-primary text-sm font-medium">Цвет функции</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {colorOptions.map(({ name, class: colorClass }) => (
                <ColorDot
                  key={name}
                  colorClass={colorClass}
                  isSelected={shape.props.plotColor === name}
                  onClick={() => updateProps({ plotColor: name as TColor })}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="X min"
              value={shape.props.xMin}
              onChange={(xMin) => updateProps({ xMin })}
            />
            <NumberField
              label="X max"
              value={shape.props.xMax}
              onChange={(xMax) => updateProps({ xMax })}
            />
            <NumberField
              label="Y min"
              value={shape.props.yMin}
              onChange={(yMin) => updateProps({ yMin })}
            />
            <NumberField
              label="Y max"
              value={shape.props.yMax}
              onChange={(yMax) => updateProps({ yMax })}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-xs">Делений по X</span>
                <span className="text-text-primary text-xs">{shape.props.xDivisions}</span>
              </div>
              <Slider
                value={[shape.props.xDivisions]}
                min={1}
                max={20}
                step={1}
                onValueChange={(value) => updateProps({ xDivisions: value[0] })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-xs">Делений по Y</span>
                <span className="text-text-primary text-xs">{shape.props.yDivisions}</span>
              </div>
              <Slider
                value={[shape.props.yDivisions]}
                min={1}
                max={20}
                step={1}
                onValueChange={(value) => updateProps({ yDivisions: value[0] })}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="text-text-primary text-sm">Подписи</span>
            <Checkbox
              checked={shape.props.showLabels}
              onCheckedChange={(checked) => updateProps({ showLabels: checked === true })}
            />
          </label>
        </div>
      }
    />
  );
});
