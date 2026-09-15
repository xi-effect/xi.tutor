import type { MathInterpreterModule } from '../core/types';

export const probabilityInterpreter: MathInterpreterModule = {
  id: 'probability-tree',
  canInterpret(input) {
    const t = input.text.toLowerCase();
    return /монет/.test(t) ? 0.9 : 0;
  },
  interpret(input) {
    const t = input.text.toLowerCase();
    if (/монет/.test(t)) {
      const stages = /дважды|два раза/.test(t) ? 2 : /трижды|три раза/.test(t) ? 3 : 1;
      return [
        {
          id: 'probability-coin',
          label: 'Построить дерево исходов',
          confidence: 0.9,
          intent: {
            type: 'probability_tree',
            stages,
            outcomes: [
              { label: 'Орёл', probability: 0.5 },
              { label: 'Решка', probability: 0.5 },
            ],
          },
        },
      ];
    }
    return [];
  },
};
