import type {
  GeometryConstraint,
  GeometrySemanticModel,
  GeometrySegment,
  TriangleEntity,
} from '../semantic/types';
import { buildScene, type PointCoordinates } from './sceneBuilder';
import { ANGLE_EPSILON, GEOMETRY_EPSILON } from './math';
import {
  constructTriangleCoordinates,
  segmentKey,
  triangleLengthMap,
} from './triangleConstructions';
import type { GeometrySolveResult, GeometrySolver } from './types';

function lengthMap(model: GeometrySemanticModel): Map<string, number> {
  return triangleLengthMap(model);
}

function triangleOf(model: GeometrySemanticModel): TriangleEntity | undefined {
  return model.entities.find((entity): entity is TriangleEntity => entity.type === 'triangle');
}

function rightAngleConstraint(
  model: GeometrySemanticModel,
  triangle: TriangleEntity,
): Extract<GeometryConstraint, { type: 'angle' }> | undefined {
  return model.constraints.find(
    (constraint): constraint is Extract<GeometryConstraint, { type: 'angle' }> =>
      constraint.type === 'angle' &&
      Math.abs(constraint.value - 90) <= ANGLE_EPSILON &&
      constraint.points.every((point) => triangle.vertices.includes(point)),
  );
}

function unsatisfiable(reason: string): GeometrySolveResult {
  return { status: 'unsatisfiable', solverId: 'right-triangle', reason };
}

function completeTriangleCoordinates(
  model: GeometrySemanticModel,
  coordinates: PointCoordinates,
): PointCoordinates {
  for (const constraint of model.constraints) {
    if (constraint.type === 'midpoint') {
      const [a, b] = constraint.segment.map((point) => coordinates[point]);
      if (a && b) {
        coordinates[constraint.point] = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      }
    }
    if (constraint.type === 'altitude') {
      const from = coordinates[constraint.segment[0]];
      const [a, b] = constraint.oppositeSide.map((point) => coordinates[point]);
      if (!from || !a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const denominator = dx * dx + dy * dy;
      if (denominator <= GEOMETRY_EPSILON) continue;
      const factor = ((from.x - a.x) * dx + (from.y - a.y) * dy) / denominator;
      coordinates[constraint.segment[1]] = { x: a.x + factor * dx, y: a.y + factor * dy };
    }
    if (constraint.type === 'bisector') {
      const [aId, vertexId, cId] = constraint.angle;
      const a = coordinates[aId];
      const vertex = coordinates[vertexId];
      const c = coordinates[cId];
      if (!a || !vertex || !c) continue;
      const va = Math.hypot(a.x - vertex.x, a.y - vertex.y);
      const vc = Math.hypot(c.x - vertex.x, c.y - vertex.y);
      const denominator = va + vc;
      if (denominator <= GEOMETRY_EPSILON) continue;
      coordinates[constraint.segment[1]] = {
        x: (vc * a.x + va * c.x) / denominator,
        y: (vc * a.y + va * c.y) / denominator,
      };
    }
    if (constraint.type === 'collinear' && constraint.points.length >= 3) {
      const [firstId, middleId, lastId] = constraint.points;
      const first = coordinates[firstId];
      const middle = coordinates[middleId];
      const last = coordinates[lastId];
      if (first && middle && !last) {
        coordinates[lastId] = {
          x: middle.x + (middle.x - first.x) * 0.55,
          y: middle.y + (middle.y - first.y) * 0.55,
        };
      } else if (middle && last && !first) {
        coordinates[firstId] = {
          x: middle.x + (middle.x - last.x),
          y: middle.y + (middle.y - last.y),
        };
      } else if (first && last && !middle) {
        coordinates[middleId] = {
          x: (first.x + last.x) / 2,
          y: (first.y + last.y) / 2,
        };
      }
    }
  }
  return coordinates;
}

export const rightTriangleSolver: GeometrySolver = {
  id: 'right-triangle',
  supports(model) {
    const triangle = triangleOf(model);
    return triangle && rightAngleConstraint(model, triangle) ? 1 : 0;
  },
  solve(model) {
    const triangle = triangleOf(model);
    if (!triangle) return unsatisfiable('Треугольник не найден');
    const rightAngle = rightAngleConstraint(model, triangle);
    if (!rightAngle) return unsatisfiable('Прямой угол не найден');

    const [first, vertex, second] = rightAngle.points;
    const lengths = lengthMap(model);
    let firstLeg = lengths.get(segmentKey([first, vertex]));
    let secondLeg = lengths.get(segmentKey([vertex, second]));
    let hypotenuse = lengths.get(segmentKey([first, second]));

    if (hypotenuse != null && firstLeg != null && secondLeg == null) {
      const square = hypotenuse ** 2 - firstLeg ** 2;
      if (square <= GEOMETRY_EPSILON) return unsatisfiable('Катет не меньше гипотенузы');
      secondLeg = Math.sqrt(square);
    } else if (hypotenuse != null && secondLeg != null && firstLeg == null) {
      const square = hypotenuse ** 2 - secondLeg ** 2;
      if (square <= GEOMETRY_EPSILON) return unsatisfiable('Катет не меньше гипотенузы');
      firstLeg = Math.sqrt(square);
    } else if (firstLeg != null && secondLeg != null && hypotenuse == null) {
      hypotenuse = Math.hypot(firstLeg, secondLeg);
    }

    const invented = firstLeg == null || secondLeg == null;
    const extraAngle = model.constraints.find(
      (constraint): constraint is Extract<GeometryConstraint, { type: 'angle' }> =>
        constraint.type === 'angle' &&
        Math.abs(constraint.value - 90) > ANGLE_EPSILON &&
        constraint.points[1] !== vertex &&
        triangle.vertices.includes(constraint.points[1]),
    );
    if (extraAngle && invented && hypotenuse == null) {
      const constructed = constructTriangleCoordinates(triangle, model);
      if ('coordinates' in constructed) {
        return {
          status: constructed.complete ? 'solved' : 'partial',
          solverId: this.id,
          scene: buildScene(model, completeTriangleCoordinates(model, constructed.coordinates)),
        };
      }
    }

    firstLeg ??= 1.2;
    secondLeg ??= 1;
    hypotenuse ??= Math.hypot(firstLeg, secondLeg);
    if (Math.abs(hypotenuse ** 2 - firstLeg ** 2 - secondLeg ** 2) > GEOMETRY_EPSILON) {
      return unsatisfiable('Длины сторон несовместимы с прямым углом');
    }

    const coordinates: PointCoordinates = {
      [vertex]: { x: 0, y: firstLeg },
      [first]: { x: 0, y: 0 },
      [second]: { x: secondLeg, y: firstLeg },
    };
    return {
      status: invented ? 'partial' : 'solved',
      solverId: this.id,
      scene: buildScene(model, completeTriangleCoordinates(model, coordinates)),
    };
  },
};

function equalSides(
  model: GeometrySemanticModel,
  triangle: TriangleEntity,
): GeometrySegment[] | null {
  const equality = model.constraints.find(
    (constraint) =>
      constraint.type === 'equal_length' &&
      constraint.segments.filter((segment) =>
        segment.every((point) => triangle.vertices.includes(point)),
      ).length >= 2,
  );
  return equality?.type === 'equal_length' ? equality.segments : null;
}

export const isoscelesTriangleSolver: GeometrySolver = {
  id: 'isosceles-triangle',
  supports(model) {
    const triangle = triangleOf(model);
    return triangle && equalSides(model, triangle) ? 0.8 : 0;
  },
  solve(model) {
    const triangle = triangleOf(model);
    if (!triangle)
      return { status: 'unsatisfiable', solverId: this.id, reason: 'Треугольник не найден' };
    const equal = equalSides(model, triangle);
    if (!equal)
      return { status: 'unsatisfiable', solverId: this.id, reason: 'Равные стороны не найдены' };
    const shared = equal[0].find((point) => equal[1].includes(point));
    if (!shared)
      return {
        status: 'unsatisfiable',
        solverId: this.id,
        reason: 'Равные стороны не имеют общей вершины',
      };
    const base = triangle.vertices.filter((point) => point !== shared);
    const vertexAngle = model.constraints.find(
      (constraint) => constraint.type === 'angle' && constraint.points[1] === shared,
    );
    const baseAngle = model.constraints.find(
      (constraint) =>
        constraint.type === 'angle' &&
        constraint.points[1] !== shared &&
        constraint.points.every((point) => triangle.vertices.includes(point)),
    );
    let degrees = 70;
    if (vertexAngle?.type === 'angle') degrees = vertexAngle.value;
    else if (baseAngle?.type === 'angle') degrees = 180 - 2 * baseAngle.value;
    if (degrees <= GEOMETRY_EPSILON || degrees >= 180 - GEOMETRY_EPSILON) {
      return {
        status: 'unsatisfiable',
        solverId: this.id,
        reason: 'Некорректный угол при вершине',
      };
    }
    const half = ((degrees / 2) * Math.PI) / 180;
    const leg = 1.6;
    const coordinates: PointCoordinates = {
      [base[0]]: { x: -Math.sin(half) * leg, y: 0 },
      [base[1]]: { x: Math.sin(half) * leg, y: 0 },
      [shared]: { x: 0, y: Math.cos(half) * leg },
    };
    return {
      status: 'partial',
      solverId: this.id,
      scene: buildScene(model, completeTriangleCoordinates(model, coordinates)),
    };
  },
};

export const similarTrianglesSolver: GeometrySolver = {
  id: 'similar-triangles',
  supports(model) {
    return model.constraints.some((constraint) => constraint.type === 'similar_triangles')
      ? 0.75
      : 0;
  },
  solve(model) {
    const similar = model.constraints.find((constraint) => constraint.type === 'similar_triangles');
    const triangles = model.entities.filter(
      (entity): entity is TriangleEntity => entity.type === 'triangle',
    );
    const first =
      triangles.find((triangle) => triangle.id === similar?.triangles[0]) ?? triangles[0];
    const second =
      triangles.find((triangle) => triangle.id === similar?.triangles[1]) ?? triangles[1];
    if (!first || !second) {
      return {
        status: 'unsatisfiable',
        solverId: this.id,
        reason: 'Пара треугольников не найдена',
      };
    }
    const [a, b, c] = first.vertices;
    const [d, e, f] = second.vertices;
    const firstTriangle = constructTriangleCoordinates(first, model);
    const source =
      'coordinates' in firstTriangle
        ? firstTriangle.coordinates
        : {
            [a]: { x: 0, y: 0 },
            [b]: { x: 2, y: 0 },
            [c]: { x: 0.7, y: 1.4 },
          };
    const origin = source[a] ?? { x: 0, y: 0 };
    const scale = 0.7;
    const shift = 3.2;
    const coordinates: PointCoordinates = {
      ...source,
      [d]: { x: shift, y: 0 },
      [e]: {
        x: shift + ((source[b]?.x ?? 2) - origin.x) * scale,
        y: ((source[b]?.y ?? 0) - origin.y) * scale,
      },
      [f]: {
        x: shift + ((source[c]?.x ?? 0.7) - origin.x) * scale,
        y: ((source[c]?.y ?? 1.4) - origin.y) * scale,
      },
    };
    return {
      status: 'partial',
      solverId: this.id,
      scene: buildScene(model, completeTriangleCoordinates(model, coordinates)),
    };
  },
};

export const triangleSolver: GeometrySolver = {
  id: 'triangle',
  supports(model) {
    return triangleOf(model) ? 0.4 : 0;
  },
  solve(model) {
    const triangle = triangleOf(model);
    if (!triangle)
      return { status: 'unsatisfiable', solverId: this.id, reason: 'Треугольник не найден' };
    const constructed = constructTriangleCoordinates(triangle, model);
    if ('unsatisfiable' in constructed) {
      return { status: 'unsatisfiable', solverId: this.id, reason: constructed.unsatisfiable };
    }
    return {
      status: constructed.complete ? 'solved' : 'partial',
      solverId: this.id,
      scene: buildScene(model, completeTriangleCoordinates(model, constructed.coordinates)),
    };
  },
};
