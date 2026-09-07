import type { GeometrySemanticModel } from '../semantic/types';
import type { GeometryScene } from '../scene/types';

export type GeometrySolveResult =
  | {
      status: 'solved' | 'partial';
      solverId: string;
      scene: GeometryScene;
      debug?: GeometryDebugResult;
    }
  | {
      status: 'unsatisfiable';
      solverId?: string;
      reason: string;
      debug?: GeometryDebugResult;
    };

export type GeometrySolver = {
  id: string;
  supports(model: GeometrySemanticModel): number;
  solve(model: GeometrySemanticModel): GeometrySolveResult;
};

export type GeometryDebugResult = {
  input?: string;
  semanticModel: GeometrySemanticModel;
  expandedModel: GeometrySemanticModel;
  selectedSolver?: string;
  scene?: GeometryScene;
  validation?: string;
};
