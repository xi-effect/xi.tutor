import type { MathInterpreterModule } from '../core/types';
import { normalizeMathText } from '../utils/normalize';

const pointRegex =
  /\b([A-ZА-Я][A-ZА-Я0-9₀-₉']*)\s*\(\s*(-?\d+(?:[.,]\d+)?)\s*[;,]\s*(-?\d+(?:[.,]\d+)?)\s*\)/g;

export const coordinatePointsInterpreter: MathInterpreterModule = {
  id: 'coordinate-points',
  canInterpret(input) {
    return normalizeMathText(input.text).match(pointRegex)?.length ? 0.96 : 0;
  },
  interpret(input) {
    const text = normalizeMathText(input.text);
    const points = [...text.matchAll(pointRegex)].map((m) => ({
      name: m[1],
      x: Number(m[2].replace(',', '.')),
      y: Number(m[3].replace(',', '.')),
    }));
    if (!points.length) return [];
    const connect = /треугольник|многоугольник|соедините|соединить/i.test(text);
    return [
      {
        id: 'coordinate-points',
        label: connect ? 'Построить фигуру по точкам' : 'Построить точки',
        confidence: 0.96,
        intent: { type: 'coordinate_points', points, connect },
      },
    ];
  },
};
