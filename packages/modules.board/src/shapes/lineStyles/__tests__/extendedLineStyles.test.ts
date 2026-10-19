import { describe, expect, it } from 'vitest';
import { PathBuilder } from '@ibodr/draw';
import { dashDotStroke } from '../dashDot';
import { buildWavyPathD, type WavyCommand } from '../wavyPath';
import { installExtendedLineStyles } from '../extendedLineStyles';
import { availableLineStyles } from '../../../ui/components/popups/Arrows/lineStyle';

installExtendedLineStyles();

function pathPoints(d: string) {
  const nums = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const points: Array<{ x: number; y: number }> = [];
  for (let index = 0; index < nums.length; index += 2) {
    points.push({ x: nums[index], y: nums[index + 1] });
  }
  return points;
}

function line(x2: number, y2: number): WavyCommand[] {
  return [
    { type: 'move', x: 0, y: 0, isClose: false },
    { type: 'line', x: x2, y: y2, isClose: false },
  ];
}

describe('dashDotStroke', () => {
  it('укладывает целое число циклов и заканчивает линию на тире', () => {
    const length = 220;
    const { strokeDasharray, strokeDashoffset } = dashDotStroke(length, 3.5);
    const parts = strokeDasharray.split(' ').map(Number);

    expect(parts).toHaveLength(4);
    expect(parts[0]).toBeGreaterThan(parts[2] * 4);
    expect(Number(strokeDashoffset)).toBeCloseTo(parts[0] / 2, 1);

    const cycle = parts.reduce((sum, part) => sum + part, 0);
    expect(length / cycle).toBeCloseTo(Math.round(length / cycle), 1);
  });

  it('короткий штрих оставляет сплошным', () => {
    expect(dashDotStroke(8, 4).strokeDasharray).toBe('none');
  });
});

describe('buildWavyPathD', () => {
  it('качает горизонтальную линию и возвращает концы на ось', () => {
    const d = buildWavyPathD(line(240, 0), 3);
    expect(d).toBeTruthy();
    const points = pathPoints(d!);
    const ys = points.map((point) => point.y);

    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points[points.length - 1].x).toBeCloseTo(240, 0);
    expect(points[points.length - 1].y).toBeCloseTo(0, 0);
    expect(Math.max(...ys.map(Math.abs))).toBeGreaterThan(2);
    expect(ys.some((y) => y > 1)).toBe(true);
    expect(ys.some((y) => y < -1)).toBe(true);
  });

  it('качает вертикальную линию поперёк хода', () => {
    const d = buildWavyPathD(line(0, 240), 3);
    const xs = pathPoints(d!).map((point) => point.x);
    expect(Math.max(...xs.map(Math.abs))).toBeGreaterThan(2);
    expect(pathPoints(d!)[0]).toEqual({ x: 0, y: 0 });
  });

  it('не волнит слишком короткий отрезок', () => {
    expect(buildWavyPathD(line(12, 0), 3)).toBeNull();
  });
});

describe('PathBuilder line styles', () => {
  it('показывает новые стили в меню', () => {
    expect(availableLineStyles).toEqual([
      'solid',
      'dashed',
      'dotted',
      'sparse',
      'dash-dot',
      'wavy',
      'double',
    ]);
  });

  it('рисует точка-тире отдельным штрихом, а волну — кривой', () => {
    const path = new PathBuilder().moveTo(0, 0).lineTo(200, 0);
    const dashDot = path.toSvg({
      style: 'dash-dot' as 'solid',
      strokeWidth: 3,
    });
    const dashChild = Array.isArray(dashDot?.props.children)
      ? dashDot?.props.children[0]
      : dashDot?.props.children;

    expect(dashChild?.props.strokeDasharray).toMatch(/\d/);
    expect(dashChild?.props.d).toContain('M');
    expect(dashChild?.props.strokeLinecap).toBe('round');

    const wavy = path.toSvg({
      style: 'wavy' as 'solid',
      strokeWidth: 3,
    });
    expect(wavy?.props.d.match(/L/g)?.length ?? 0).toBeGreaterThan(8);

    const solid = path.toSvg({ style: 'solid', strokeWidth: 3 });
    expect(solid?.props.strokeDasharray).toBeUndefined();
    expect(solid?.props.d.match(/L/g)?.length ?? 0).toBe(1);
  });

  it('на сильном отдалении оставляет волну сплошной', () => {
    const path = new PathBuilder().moveTo(0, 0).lineTo(200, 0);
    const forced = path.toSvg({
      style: 'wavy' as 'solid',
      strokeWidth: 3,
      forceSolid: true,
    });
    expect(forced?.props.d.match(/L/g)?.length ?? 0).toBe(1);
  });

  it('ведёт волну по дуге', () => {
    const path = new PathBuilder().moveTo(0, 40).circularArcTo(80, false, true, 160, 40);
    const wavy = path.toSvg({
      style: 'wavy' as 'solid',
      strokeWidth: 3,
    });
    const solid = path.toSvg({ style: 'solid', strokeWidth: 3 });
    expect(solid?.props.d.includes('C')).toBe(true);
    expect(wavy?.props.d.includes('C')).toBe(false);
    expect(wavy?.props.d.match(/L/g)?.length ?? 0).toBeGreaterThan(8);
  });
});
