import type { CircleEntity, GeometryConstraint, GeometrySemanticModel } from '../semantic/types';
import { buildScene, type PointCoordinates } from './sceneBuilder';
import { evaluateGeometryScalar } from './math';
import type { GeometrySolver } from './types';

function circleOf(model: GeometrySemanticModel): CircleEntity | undefined {
  return model.entities.find((entity): entity is CircleEntity => entity.type === 'circle');
}

function radiusOf(model: GeometrySemanticModel, circle: CircleEntity): number {
  const radius = model.constraints.find(
    (constraint) => constraint.type === 'radius' && constraint.circle === circle.id,
  );
  if (radius?.type === 'radius' && radius.value) {
    return evaluateGeometryScalar(radius.value) ?? 1;
  }
  return 1;
}

function pointOnUnitCircle(degrees: number, radius: number) {
  const radians = (degrees * Math.PI) / 180;
  return { x: Math.cos(radians) * radius, y: -Math.sin(radians) * radius };
}

function angleForDiameters(
  model: GeometrySemanticModel,
  diameters: Extract<GeometryConstraint, { type: 'diameter' }>[],
) {
  for (const constraint of model.constraints) {
    if (constraint.type !== 'angle') continue;
    const [first, vertex, third] = constraint.points;
    const firstDiameter = diameters.find(
      (diameter) => diameter.segment.includes(first) && diameter.segment.includes(vertex),
    );
    const secondDiameter = diameters.find((diameter) => diameter.segment.includes(third));
    if (firstDiameter && secondDiameter && firstDiameter !== secondDiameter) {
      return { constraint, firstDiameter, secondDiameter };
    }
  }
  return null;
}

export const circleDiameterSolver: GeometrySolver = {
  id: 'circle-diameters',
  supports(model) {
    const circle = circleOf(model);
    const diameterCount = model.constraints.filter(
      (constraint) => constraint.type === 'diameter' && constraint.circle === circle?.id,
    ).length;
    return circle && diameterCount > 0 ? (diameterCount > 1 ? 0.95 : 0.85) : 0;
  },
  solve(model) {
    const circle = circleOf(model);
    if (!circle) {
      return { status: 'unsatisfiable', solverId: this.id, reason: 'Окружность не найдена' };
    }
    const diameters = model.constraints.filter(
      (constraint): constraint is Extract<GeometryConstraint, { type: 'diameter' }> =>
        constraint.type === 'diameter' && constraint.circle === circle.id,
    );
    const radius = radiusOf(model, circle);
    const coordinates: PointCoordinates = { [circle.center]: { x: 0, y: 0 } };
    const interpretedAngle = angleForDiameters(model, diameters);

    if (interpretedAngle) {
      const { constraint, firstDiameter, secondDiameter } = interpretedAngle;
      const [first, vertex, third] = constraint.points;
      const oppositeSecond = secondDiameter.segment.find((point) => point !== third)!;
      coordinates[vertex] = { x: radius, y: 0 };
      coordinates[first] = { x: -radius, y: 0 };
      const thirdDegrees = 180 - 2 * constraint.value;
      coordinates[third] = pointOnUnitCircle(thirdDegrees, radius);
      coordinates[oppositeSecond] = pointOnUnitCircle(thirdDegrees + 180, radius);
      const unusedFirst = firstDiameter.segment.filter(
        (point) => point !== first && point !== vertex,
      );
      unusedFirst.forEach((point) => {
        coordinates[point] = { x: -radius, y: 0 };
      });
    }

    diameters.forEach((diameter, index) => {
      const [a, b] = diameter.segment;
      if (coordinates[a] && coordinates[b]) return;
      const degrees = index * (180 / Math.max(diameters.length, 2));
      coordinates[a] = pointOnUnitCircle(degrees, radius);
      coordinates[b] = pointOnUnitCircle(degrees + 180, radius);
    });

    const onCircle = model.constraints.filter(
      (constraint): constraint is Extract<GeometryConstraint, { type: 'point_on_circle' }> =>
        constraint.type === 'point_on_circle' && constraint.circle === circle.id,
    );
    onCircle.forEach((constraint, index) => {
      coordinates[constraint.point] ??= pointOnUnitCircle(
        (index * 360) / Math.max(onCircle.length, 3),
        radius,
      );
    });

    return {
      status: interpretedAngle ? 'solved' : 'partial',
      solverId: this.id,
      scene: buildScene(model, coordinates, [{ id: circle.id, center: circle.center, radius }]),
    };
  },
};

export const genericCircleSolver: GeometrySolver = {
  id: 'circle',
  supports(model) {
    return circleOf(model) ? 0.45 : 0;
  },
  solve(model) {
    const circle = circleOf(model);
    if (!circle) {
      return { status: 'unsatisfiable', solverId: this.id, reason: 'Окружность не найдена' };
    }
    const radius = radiusOf(model, circle);
    const coordinates: PointCoordinates = { [circle.center]: { x: 0, y: 0 } };
    const onCircle = model.constraints.filter(
      (constraint): constraint is Extract<GeometryConstraint, { type: 'point_on_circle' }> =>
        constraint.type === 'point_on_circle' && constraint.circle === circle.id,
    );
    onCircle.forEach((constraint, index) => {
      coordinates[constraint.point] = pointOnUnitCircle(
        (index * 360) / Math.max(onCircle.length, 3),
        radius,
      );
    });
    for (const constraint of model.constraints) {
      if (constraint.type === 'angle' && constraint.points[1] === circle.center) {
        coordinates[constraint.points[0]] = pointOnUnitCircle(0, radius);
        coordinates[constraint.points[2]] = pointOnUnitCircle(constraint.value, radius);
      }
      if (constraint.type === 'tangent' && constraint.circle === circle.id && constraint.at) {
        const at = (coordinates[constraint.at] ??= pointOnUnitCircle(0, radius));
        const other = constraint.line.find((point) => point !== constraint.at);
        if (other) {
          const radial = { x: at.x / radius, y: at.y / radius };
          coordinates[other] = {
            x: at.x - radial.y * radius * 1.5,
            y: at.y + radial.x * radius * 1.5,
          };
        }
      }
    }
    const pointEntities = model.entities.filter(
      (entity) => entity.type === 'point' && entity.id !== circle.center,
    );
    pointEntities.forEach((point, index) => {
      coordinates[point.id] ??= pointOnUnitCircle(
        (index * 360) / Math.max(pointEntities.length, 3),
        radius * 1.4,
      );
    });
    return {
      status: 'partial',
      solverId: this.id,
      scene: buildScene(model, coordinates, [{ id: circle.id, center: circle.center, radius }]),
    };
  },
};
