import type { GeometryIntent } from '../intent/schemas';
import type { LegacyVisualizationSuggestion } from '../types';

const VERTEX_NAME = '[A-ZА-ЯЁ]';

function verticesFromLetters(letters: string): [string, string, string] | null {
  const chars = [...letters.toUpperCase()].filter((char) => /[A-ZА-ЯЁ]/.test(char));
  if (chars.length !== 3) return null;
  return [chars[0], chars[1], chars[2]];
}

export function parseGeometryShortcuts(content: string): LegacyVisualizationSuggestion[] {
  const text = content.replace(/\s+/g, ' ').trim();
  const objects: GeometryIntent['objects'] = [];
  const relations: NonNullable<GeometryIntent['relations']> = [];
  const angles: NonNullable<GeometryIntent['angles']> = [];
  const summaryParts: string[] = [];

  const isosceles = text.match(
    new RegExp(`равнобедренн[а-яё]*\\s+треугольник\\s+(${VERTEX_NAME}{3})`, 'i'),
  );
  const rightTriangle = text.match(
    new RegExp(`прямоугольн[а-яё]*\\s+треугольник\\s+(${VERTEX_NAME}{3})`, 'i'),
  );
  const triangle = text.match(new RegExp(`треугольник\\s+(${VERTEX_NAME}{3})`, 'i'));

  if (isosceles?.[1] || rightTriangle?.[1] || triangle?.[1]) {
    const letters = isosceles?.[1] ?? rightTriangle?.[1] ?? triangle?.[1];
    const vertices = letters ? verticesFromLetters(letters) : null;
    if (vertices) {
      const kind = isosceles ? 'isosceles' : rightTriangle ? 'right' : 'scalene';
      objects.push({ type: 'triangle', vertices, kind });
      summaryParts.push(`треугольник ${vertices.join('')}`);
      if (kind === 'isosceles') {
        const base = text.match(new RegExp(`основание\\s+(${VERTEX_NAME}{2})`, 'i'));
        if (base?.[1]) {
          const equalFrom = vertices.find((vertex) => !base[1].toUpperCase().includes(vertex));
          if (equalFrom) {
            const [first, second] = [...base[1].toUpperCase()];
            relations.push({
              type: 'equal_length',
              segments: [`${equalFrom}${first}`, `${equalFrom}${second}`],
            });
          }
        } else {
          relations.push({
            type: 'equal_length',
            segments: [`${vertices[0]}${vertices[1]}`, `${vertices[1]}${vertices[2]}`],
          });
        }
      }
    }
  }

  const circle = text.match(
    new RegExp(
      `окружност[а-яё]*.{0,40}центр[а-яё]*\\s+(${VERTEX_NAME}).{0,40}радиус[а-яё]*\\s+(\\d+(?:[.,]\\d+)?)`,
      'i',
    ),
  );
  if (circle?.[1]) {
    const radius = Number(String(circle[2]).replace(',', '.'));
    objects.push({
      type: 'circle',
      center: circle[1].toUpperCase(),
      radius: Number.isFinite(radius) ? radius : undefined,
    });
    objects.push({ type: 'point', name: circle[1].toUpperCase() });
    summaryParts.push(`окружность ${circle[1].toUpperCase()}`);
  }

  const angle =
    text.match(new RegExp(`∠\\s*(${VERTEX_NAME}{3})\\s*=\\s*(\\d+(?:[.,]\\d+)?)\\s*°?`)) ??
    text.match(new RegExp(`угол\\s+(${VERTEX_NAME}{3})\\s*=\\s*(\\d+(?:[.,]\\d+)?)\\s*°?`, 'i'));
  if (angle?.[1]) {
    const value = Number(String(angle[2]).replace(',', '.'));
    const name = angle[1].toUpperCase();
    objects.push({
      type: 'angle',
      name,
      points: [name[0], name[1], name[2]],
      value: Number.isFinite(value) ? value : undefined,
    });
    if (Number.isFinite(value)) {
      angles.push({ name, value });
    }
    summaryParts.push(`∠${name}${Number.isFinite(value) ? ` = ${value}°` : ''}`);
  }

  if (objects.length === 0) return [];

  return [
    {
      intent: {
        type: 'geometry',
        objects,
        relations: relations.length > 0 ? relations : undefined,
        angles: angles.length > 0 ? angles : undefined,
      },
      confidence: 0.82,
      labelKey: 'visualize.actions.geometry',
      summary: summaryParts.join('; '),
    },
  ];
}
