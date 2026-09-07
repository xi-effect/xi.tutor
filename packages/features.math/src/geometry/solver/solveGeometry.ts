import { expandGeometryConstraints } from '../constraints/expandConstraints';
import { validateGeometryConstraints } from '../constraints/validateConstraints';
import type { GeometrySemanticModel } from '../semantic/types';
import { circleDiameterSolver, genericCircleSolver } from './circleSolver';
import { genericGeometrySolver } from './genericSolver';
import {
  isoscelesTriangleSolver,
  rightTriangleSolver,
  similarTrianglesSolver,
  triangleSolver,
} from './triangleSolver';
import type { GeometryDebugResult, GeometrySolveResult, GeometrySolver } from './types';

export const geometrySolvers: GeometrySolver[] = [
  rightTriangleSolver,
  circleDiameterSolver,
  similarTrianglesSolver,
  isoscelesTriangleSolver,
  triangleSolver,
  genericCircleSolver,
  genericGeometrySolver,
];

export function solveGeometry(
  model: GeometrySemanticModel,
  options: { debug?: boolean; input?: string } = {},
): GeometrySolveResult {
  const expandedModel = expandGeometryConstraints(model);
  const validation = validateGeometryConstraints(expandedModel);
  const debug: GeometryDebugResult | undefined = options.debug
    ? {
        input: options.input,
        semanticModel: model,
        expandedModel,
        validation: validation.valid ? 'valid' : validation.reason,
      }
    : undefined;
  if (!validation.valid) {
    return { status: 'unsatisfiable', reason: validation.reason, debug };
  }

  const selected = geometrySolvers
    .map((solver) => ({ solver, score: solver.supports(expandedModel) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)[0]?.solver;
  if (!selected) {
    return { status: 'unsatisfiable', reason: 'Не найден подходящий geometry solver', debug };
  }

  const result = selected.solve(expandedModel);
  if (!debug) return result;
  debug.selectedSolver = selected.id;
  if (result.status !== 'unsatisfiable') debug.scene = result.scene;
  return { ...result, debug };
}
