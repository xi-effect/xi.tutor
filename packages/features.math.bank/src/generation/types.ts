import type { MathDifficulty, MathGrade, MathTask } from '../model/schema';

export type MathTaskFamilyContext = {
  grade: MathGrade;
  difficulty: MathDifficulty;
  seed: number;
  sequence: number;
};

/**
 * Contract for all NEW families. Existing 21k tasks are canonical content;
 * future additions should implement this interface in TypeScript.
 */
export type MathTaskFamily = {
  id: string;
  variantGroupId: string;
  grade: MathGrade;
  difficulties: readonly MathDifficulty[];
  generate: (context: MathTaskFamilyContext) => Omit<MathTask, 'id' | 'fingerprint'>;
};
