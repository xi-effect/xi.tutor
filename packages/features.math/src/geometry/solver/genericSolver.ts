import type { GeometrySemanticModel } from '../semantic/types';
import { buildScene, type PointCoordinates } from './sceneBuilder';
import type { GeometrySolver } from './types';

export const genericGeometrySolver: GeometrySolver = {
  id: 'generic-geometry',
  supports() {
    return 0.1;
  },
  solve(model: GeometrySemanticModel) {
    const coordinates: PointCoordinates = {};
    const quadrilateral = model.entities.find((entity) => entity.type === 'quadrilateral');
    if (quadrilateral?.type === 'quadrilateral') {
      const [a, b, c, d] = quadrilateral.vertices;
      const rectangular = quadrilateral.kind === 'rectangle' || quadrilateral.kind === 'square';
      coordinates[a] = { x: 0, y: 0 };
      if (quadrilateral.kind === 'rhombus') {
        const height = Math.sqrt(1.6 ** 2 - 0.8 ** 2);
        coordinates[b] = { x: 1.6, y: 0 };
        coordinates[c] = { x: 2.4, y: height };
        coordinates[d] = { x: 0.8, y: height };
      } else if (quadrilateral.kind === 'parallelogram') {
        coordinates[b] = { x: 2.2, y: 0 };
        coordinates[c] = { x: 2.8, y: 1.3 };
        coordinates[d] = { x: 0.6, y: 1.3 };
      } else {
        coordinates[b] = { x: rectangular ? 2 : 2.2, y: 0 };
        coordinates[c] = {
          x: rectangular ? 2 : 1.8,
          y: quadrilateral.kind === 'square' ? 2 : 1.3,
        };
        coordinates[d] = {
          x: quadrilateral.kind === 'trapezoid' ? 0.4 : 0,
          y: quadrilateral.kind === 'square' ? 2 : 1.3,
        };
      }
    }

    for (const constraint of model.constraints) {
      if (constraint.type === 'angle') {
        const [a, vertex, c] = constraint.points;
        const radians = (constraint.value * Math.PI) / 180;
        coordinates[vertex] ??= { x: 0, y: 0 };
        coordinates[a] ??= { x: coordinates[vertex].x + 1.2, y: coordinates[vertex].y };
        coordinates[c] ??= {
          x: coordinates[vertex].x + Math.cos(radians) * 1.2,
          y: coordinates[vertex].y + Math.sin(radians) * 1.2,
        };
      }
      if (constraint.type === 'equal_angle') {
        constraint.angles.forEach(([a, vertex, c], index) => {
          const origin = { x: index * 3, y: 0 };
          coordinates[vertex] ??= origin;
          coordinates[a] ??= { x: origin.x + 1.2, y: origin.y };
          coordinates[c] ??= {
            x: origin.x + Math.cos(Math.PI / 3) * 1.2,
            y: origin.y + Math.sin(Math.PI / 3) * 1.2,
          };
        });
      }
      if (constraint.type === 'collinear') {
        constraint.points.forEach((point, index) => {
          coordinates[point] ??= { x: index, y: 0 };
        });
      }
      if (constraint.type === 'midpoint') {
        const [a, b] = constraint.segment;
        coordinates[a] ??= { x: 0, y: 0 };
        coordinates[b] ??= { x: 2, y: 0 };
        coordinates[constraint.point] = {
          x: (coordinates[a].x + coordinates[b].x) / 2,
          y: (coordinates[a].y + coordinates[b].y) / 2,
        };
      }
      if (constraint.type === 'perpendicular') {
        const shared = constraint.first.find((point) => constraint.second.includes(point));
        if (shared) {
          const first = constraint.first.find((point) => point !== shared)!;
          const second = constraint.second.find((point) => point !== shared)!;
          coordinates[shared] ??= { x: 0, y: 0 };
          coordinates[first] ??= { x: 1.5, y: 0 };
          coordinates[second] ??= { x: 0, y: 1.5 };
        } else {
          const [a, b] = constraint.first;
          const [c, d] = constraint.second;
          coordinates[a] ??= { x: 0, y: 0 };
          coordinates[b] ??= { x: 2, y: 0 };
          coordinates[c] ??= { x: 1, y: -1 };
          coordinates[d] ??= { x: 1, y: 1 };
        }
      }
      if (constraint.type === 'parallel') {
        const [a, b] = constraint.first;
        const [c, d] = constraint.second;
        coordinates[a] ??= { x: 0, y: 0 };
        coordinates[b] ??= { x: 2, y: 0 };
        coordinates[c] ??= { x: 0, y: 1 };
        coordinates[d] ??= { x: 2, y: 1 };
      }
      if (constraint.type === 'equal_length') {
        constraint.segments.forEach(([a, b], index) => {
          if (!coordinates[a] && !coordinates[b]) {
            coordinates[a] = { x: 0, y: index };
            coordinates[b] = { x: 1.5, y: index };
          } else if (coordinates[a] && !coordinates[b]) {
            const direction = index === 0 ? 0 : (index * Math.PI) / 3;
            coordinates[b] = {
              x: coordinates[a].x + Math.cos(direction) * 1.5,
              y: coordinates[a].y + Math.sin(direction) * 1.5,
            };
          } else if (!coordinates[a] && coordinates[b]) {
            coordinates[a] = { x: coordinates[b].x - 1.5, y: coordinates[b].y };
          }
        });
      }
    }

    const points = model.entities.filter((entity) => entity.type === 'point');
    points.forEach((point, index) => {
      if (coordinates[point.id]) return;
      const angle = (index * 2 * Math.PI) / Math.max(points.length, 3);
      coordinates[point.id] = { x: Math.cos(angle), y: Math.sin(angle) };
    });

    return {
      status: 'partial' as const,
      solverId: this.id,
      scene: buildScene(model, coordinates),
    };
  },
};
