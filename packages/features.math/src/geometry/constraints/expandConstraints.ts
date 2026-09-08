import type {
  GeometryConstraint,
  GeometryEntity,
  GeometrySemanticModel,
  GeometrySegment,
} from '../semantic/types';

function segmentKey([a, b]: GeometrySegment): string {
  return [a, b].sort().join('');
}

function addUnique<T>(items: T[], item: T) {
  const key = JSON.stringify(item);
  if (!items.some((current) => JSON.stringify(current) === key)) items.push(item);
}

export function expandGeometryConstraints(model: GeometrySemanticModel): GeometrySemanticModel {
  const entities: GeometryEntity[] = [...model.entities];
  const constraints: GeometryConstraint[] = [...model.constraints];

  for (const constraint of model.constraints) {
    if (constraint.type === 'angle' && Math.abs(constraint.value - 90) < 1e-6) {
      const [a, vertex, c] = constraint.points;
      addUnique(constraints, {
        type: 'perpendicular',
        first: [a, vertex],
        second: [vertex, c],
      });
    }

    if (constraint.type === 'diameter') {
      const circle = entities.find(
        (entity) => entity.type === 'circle' && entity.id === constraint.circle,
      );
      if (!circle || circle.type !== 'circle') continue;
      const [a, b] = constraint.segment;
      addUnique(constraints, { type: 'collinear', points: [a, circle.center, b] });
      addUnique(constraints, { type: 'midpoint', point: circle.center, segment: [a, b] });
      addUnique(constraints, { type: 'point_on_circle', point: a, circle: circle.id });
      addUnique(constraints, { type: 'point_on_circle', point: b, circle: circle.id });
      addUnique(constraints, {
        type: 'equal_length',
        segments: [
          [circle.center, a],
          [circle.center, b],
        ],
      });
    }

    if (constraint.type === 'radius') {
      addUnique(constraints, {
        type: 'point_on_circle',
        point: constraint.segment[1],
        circle: constraint.circle,
      });
    }

    if (constraint.type === 'chord') {
      addUnique(constraints, {
        type: 'point_on_circle',
        point: constraint.segment[0],
        circle: constraint.circle,
      });
      addUnique(constraints, {
        type: 'point_on_circle',
        point: constraint.segment[1],
        circle: constraint.circle,
      });
    }

    if (constraint.type === 'tangent' && constraint.at) {
      const circle = entities.find(
        (entity) => entity.type === 'circle' && entity.id === constraint.circle,
      );
      if (circle?.type === 'circle') {
        addUnique(constraints, {
          type: 'point_on_circle',
          point: constraint.at,
          circle: circle.id,
        });
        addUnique(constraints, {
          type: 'perpendicular',
          first: [circle.center, constraint.at],
          second: constraint.line,
        });
        addUnique(constraints, {
          type: 'radius',
          circle: circle.id,
          segment: [circle.center, constraint.at],
        });
      }
    }

    if (constraint.type === 'arc_measure') {
      const circle = entities.find(
        (entity) => entity.type === 'circle' && entity.id === constraint.circle,
      );
      if (circle?.type === 'circle') {
        addUnique(constraints, {
          type: 'point_on_circle',
          point: constraint.from,
          circle: circle.id,
        });
        addUnique(constraints, {
          type: 'point_on_circle',
          point: constraint.to,
          circle: circle.id,
        });
        addUnique(constraints, {
          type: 'angle',
          points: [constraint.from, circle.center, constraint.to],
          value: constraint.value,
        });
        addUnique(constraints, {
          type: 'chord',
          circle: circle.id,
          segment: [constraint.from, constraint.to],
        });
      }
    }

    if (constraint.type === 'cyclic') {
      for (const point of constraint.points) {
        addUnique(constraints, { type: 'point_on_circle', point, circle: constraint.circle });
      }
    }

    if (constraint.type === 'median') {
      const midpoint = constraint.segment[1];
      addUnique(constraints, {
        type: 'midpoint',
        point: midpoint,
        segment: constraint.oppositeSide,
      });
      addUnique(constraints, {
        type: 'point_on_segment',
        point: midpoint,
        segment: constraint.oppositeSide,
      });
    }

    if (constraint.type === 'altitude') {
      addUnique(constraints, {
        type: 'perpendicular',
        first: constraint.segment,
        second: constraint.oppositeSide,
      });
      addUnique(constraints, {
        type: 'point_on_segment',
        point: constraint.segment[1],
        segment: constraint.oppositeSide,
      });
    }

    if (constraint.type === 'bisector') {
      const [a, vertex, c] = constraint.angle;
      const through = constraint.segment[1];
      addUnique(constraints, {
        type: 'equal_angle',
        angles: [
          [a, vertex, through],
          [through, vertex, c],
        ],
      });
      addUnique(constraints, {
        type: 'point_on_segment',
        point: through,
        segment: [a, c],
      });
    }
  }

  for (const circle of entities) {
    if (circle.type !== 'circle') continue;
    const points = constraints
      .filter(
        (constraint): constraint is Extract<GeometryConstraint, { type: 'point_on_circle' }> =>
          constraint.type === 'point_on_circle' && constraint.circle === circle.id,
      )
      .map((constraint) => constraint.point);
    if (points.length > 1) {
      const showRadii = constraints.some(
        (constraint) =>
          (constraint.type === 'radius' || constraint.type === 'diameter') &&
          constraint.circle === circle.id,
      );
      if (showRadii) {
        addUnique(constraints, {
          type: 'equal_length',
          segments: points.map((point): GeometrySegment => [circle.center, point]),
        });
      }
    }
  }

  const referencedSegments = new Map<string, GeometrySegment>();
  for (const constraint of constraints) {
    if ('segment' in constraint && Array.isArray(constraint.segment)) {
      referencedSegments.set(segmentKey(constraint.segment), constraint.segment);
    }
    if ('first' in constraint)
      referencedSegments.set(segmentKey(constraint.first), constraint.first);
    if ('second' in constraint) {
      referencedSegments.set(segmentKey(constraint.second), constraint.second);
    }
  }
  for (const segment of referencedSegments.values()) {
    const id = `segment-${segmentKey(segment)}`;
    if (!entities.some((entity) => entity.type === 'segment' && entity.id === id)) {
      entities.push({ type: 'segment', id, from: segment[0], to: segment[1] });
    }
  }

  return { ...model, entities, constraints };
}
