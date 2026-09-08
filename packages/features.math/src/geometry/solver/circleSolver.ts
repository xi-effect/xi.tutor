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

function tangentOf(model: GeometrySemanticModel, circle: CircleEntity) {
  return model.constraints.find(
    (constraint): constraint is Extract<GeometryConstraint, { type: 'tangent' }> =>
      constraint.type === 'tangent' && constraint.circle === circle.id,
  );
}

function arcOf(model: GeometrySemanticModel, circle: CircleEntity) {
  return model.constraints.find(
    (constraint): constraint is Extract<GeometryConstraint, { type: 'arc_measure' }> =>
      constraint.type === 'arc_measure' && constraint.circle === circle.id,
  );
}

export const circleTangentArcSolver: GeometrySolver = {
  id: 'circle-tangent-arc',
  supports(model) {
    const circle = circleOf(model);
    if (!circle) return 0;
    const tangent = tangentOf(model, circle);
    if (!tangent) return 0;
    return arcOf(model, circle) ? 0.93 : 0.72;
  },
  solve(model) {
    const circle = circleOf(model);
    if (!circle) {
      return { status: 'unsatisfiable', solverId: this.id, reason: 'Окружность не найдена' };
    }
    const tangent = tangentOf(model, circle);
    if (!tangent) {
      return { status: 'unsatisfiable', solverId: this.id, reason: 'Касательная не найдена' };
    }
    const radius = radiusOf(model, circle);
    const contact =
      tangent.at && tangent.line.includes(tangent.at)
        ? tangent.at
        : (tangent.line.find((point) => point !== circle.center) ?? tangent.line[0]);
    const outer = tangent.line.find((point) => point !== contact) ?? tangent.line[1];
    const arc = arcOf(model, circle);
    const farArc = arc ? (arc.from === contact ? arc.to : arc.from) : undefined;
    const secantPoint = model.constraints.find(
      (constraint): constraint is Extract<GeometryConstraint, { type: 'point_on_segment' }> =>
        constraint.type === 'point_on_segment' &&
        constraint.segment.includes(circle.center) &&
        (constraint.segment.includes(outer) || constraint.segment.includes(contact)),
    )?.point;
    const onArc = farArc ?? secantPoint;
    const degrees = arc?.value ?? 70;
    const coordinates: PointCoordinates = {
      [circle.center]: { x: 0, y: 0 },
      [contact]: { x: radius, y: 0 },
    };
    if (onArc) {
      coordinates[onArc] = pointOnUnitCircle(degrees, radius);
    }
    if (outer) {
      const tangentY =
        onArc && Math.abs(Math.cos((degrees * Math.PI) / 180)) > 1e-6
          ? -radius * Math.tan((degrees * Math.PI) / 180)
          : radius * 1.4;
      coordinates[outer] = { x: radius, y: tangentY };
    }
    const remaining = model.entities.filter(
      (entity) => entity.type === 'point' && !coordinates[entity.id],
    );
    remaining.forEach((point, index) => {
      coordinates[point.id] = pointOnUnitCircle(
        180 + (index * 40) / Math.max(remaining.length, 1),
        radius,
      );
    });
    return {
      status: arc ? 'solved' : 'partial',
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

function cyclicPoints(model: GeometrySemanticModel, circle: CircleEntity): string[] {
  const cyclic = model.constraints.find(
    (constraint) => constraint.type === 'cyclic' && constraint.circle === circle.id,
  );
  if (cyclic?.type === 'cyclic') return cyclic.points;
  const polygon =
    model.entities.find((entity) => entity.type === 'quadrilateral') ??
    model.entities.find((entity) => entity.type === 'triangle');
  if (polygon && 'vertices' in polygon) return [...polygon.vertices];
  return model.constraints
    .filter(
      (constraint): constraint is Extract<GeometryConstraint, { type: 'point_on_circle' }> =>
        constraint.type === 'point_on_circle' && constraint.circle === circle.id,
    )
    .map((constraint) => constraint.point);
}

export const cyclicPolygonSolver: GeometrySolver = {
  id: 'cyclic-polygon',
  supports(model) {
    const circle = circleOf(model);
    if (!circle) return 0;
    const cyclic = model.constraints.some(
      (constraint) => constraint.type === 'cyclic' && constraint.circle === circle.id,
    );
    const onCircle = model.constraints.filter(
      (constraint) => constraint.type === 'point_on_circle' && constraint.circle === circle.id,
    ).length;
    if (cyclic) return 0.88;
    return onCircle >= 3 && !model.constraints.some((constraint) => constraint.type === 'diameter')
      ? 0.7
      : 0;
  },
  solve(model) {
    const circle = circleOf(model);
    if (!circle) {
      return { status: 'unsatisfiable', solverId: this.id, reason: 'Окружность не найдена' };
    }
    const radius = radiusOf(model, circle);
    const vertices = cyclicPoints(model, circle);
    const coordinates: PointCoordinates = { [circle.center]: { x: 0, y: 0 } };
    const inscribed = model.constraints.filter(
      (constraint): constraint is Extract<GeometryConstraint, { type: 'angle' }> =>
        constraint.type === 'angle' &&
        constraint.points.every((point) => vertices.includes(point)),
    );
    inscribed.sort((left, right) => right.value - left.value);
    const primary = inscribed[0];
    if (primary) {
      const [first, vertex, third] = primary.points;
      coordinates[first] = pointOnUnitCircle(0, radius);
      coordinates[third] = pointOnUnitCircle(2 * primary.value, radius);
      coordinates[vertex] = pointOnUnitCircle(primary.value + 180, radius);
      for (const nested of inscribed.slice(1)) {
        if (nested.points[1] !== vertex) continue;
        const other = nested.points[0] === first ? nested.points[2] : nested.points[0];
        if (other === first || other === third || other === vertex) continue;
        coordinates[other] ??= pointOnUnitCircle(2 * nested.value, radius);
      }
    }
    vertices.forEach((point, index) => {
      coordinates[point] ??= pointOnUnitCircle((index * 360) / Math.max(vertices.length, 3), radius);
    });
    return {
      status: primary ? 'solved' : 'partial',
      solverId: this.id,
      scene: buildScene(model, coordinates, [{ id: circle.id, center: circle.center, radius }]),
    };
  },
};
