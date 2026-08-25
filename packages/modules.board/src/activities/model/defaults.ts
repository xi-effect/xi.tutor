import { createActivityId } from './ids';
import type { ActivityKind } from './kinds';
import type { ActivityAttempt, ActivityDefinition } from './types';
import { createSeed, shuffleWithSeed } from '../primitives/randomize';

function item(text: string, extra?: { imageSrc?: string }) {
  return { id: createActivityId(), text, ...extra };
}

function sortingItem(text: string, categoryId: string) {
  return { id: createActivityId(), text, categoryId };
}

export function getDefaultDefinition(kind: ActivityKind): ActivityDefinition {
  switch (kind) {
    case 'gap-text': {
      const gapId = createActivityId();
      return {
        kind: 'gap-text',
        sourceText: `The {{${gapId}}} sat on the mat.`,
        gaps: [
          {
            id: gapId,
            answers: ['cat'],
            input: 'input',
            choices: [],
          },
        ],
        bank: [],
      };
    }
    case 'matching': {
      const l1 = item('Apple');
      const l2 = item('Dog');
      const r1 = item('Фрукт');
      const r2 = item('Животное');
      return {
        kind: 'matching',
        mode: 'connect',
        left: [l1, l2],
        right: [r1, r2],
        pairs: { [l1.id]: r1.id, [l2.id]: r2.id },
      };
    }
    case 'sorting': {
      const fruit = { id: createActivityId(), title: 'Фрукты' };
      const animal = { id: createActivityId(), title: 'Животные' };
      return {
        kind: 'sorting',
        categories: [fruit, animal],
        items: [
          sortingItem('Яблоко', fruit.id),
          sortingItem('Кошка', animal.id),
          sortingItem('Груша', fruit.id),
        ],
      };
    }
    case 'ordering':
      return {
        kind: 'ordering',
        items: [item('Сначала'), item('Потом'), item('В конце')],
      };
    case 'label-image': {
      const a = createActivityId();
      const b = createActivityId();
      return {
        kind: 'label-image',
        imageSrc: '',
        hotspots: [
          { id: a, x: 0.28, y: 0.32, label: 'A' },
          { id: b, x: 0.68, y: 0.62, label: 'B' },
        ],
        extraLabels: [],
      };
    }
    case 'multiple-choice':
      return {
        kind: 'multiple-choice',
        question: 'Сколько будет 2 + 2?',
        multiple: false,
        randomize: true,
        options: [
          { id: createActivityId(), text: '3', correct: false },
          { id: createActivityId(), text: '4', correct: true },
          { id: createActivityId(), text: '5', correct: false },
        ],
      };
    case 'mystery-tiles':
      return {
        kind: 'mystery-tiles',
        columns: 2,
        tiles: [item('Текст'), item('Подсказка'), item('Картинка'), item('Задание')],
      };
    case 'random-card':
      return {
        kind: 'random-card',
        noRepeat: true,
        cards: [
          { id: createActivityId(), text: 'What is your name?' },
          { id: createActivityId(), text: 'How are you?' },
          { id: createActivityId(), text: 'Where do you live?' },
        ],
      };
  }
}

export function createEmptyAttempt(
  definition: ActivityDefinition,
  seed = createSeed(),
): ActivityAttempt {
  const order =
    definition.kind === 'ordering'
      ? shuffleWithSeed(
          definition.items.map((entry) => entry.id),
          seed,
        )
      : [];

  const optionOrder =
    definition.kind === 'multiple-choice'
      ? definition.randomize
        ? shuffleWithSeed(
            definition.options.map((option) => option.id),
            seed,
          )
        : definition.options.map((option) => option.id)
      : [];

  const bankOrder =
    definition.kind === 'matching'
      ? shuffleWithSeed(
          definition.right.map((entry) => entry.id),
          seed,
        )
      : definition.kind === 'sorting'
        ? shuffleWithSeed(
            definition.items.map((entry) => entry.id),
            seed,
          )
        : definition.kind === 'label-image'
          ? shuffleWithSeed(
              [
                ...definition.hotspots.map((hotspot) => hotspot.id),
                ...definition.extraLabels.map((label) => label.id),
              ],
              seed,
            )
          : definition.kind === 'gap-text'
            ? shuffleWithSeed(
                [
                  ...definition.gaps
                    .filter((gap) => gap.input === 'drag')
                    .map((gap) => gap.answers[0] ?? gap.id),
                  ...definition.bank,
                ].filter(Boolean),
                seed,
              )
            : [];

  const cardQueue =
    definition.kind === 'random-card'
      ? shuffleWithSeed(
          definition.cards.map((card) => card.id),
          seed,
        )
      : [];

  return {
    values: {},
    selected: {},
    placements: {},
    connections: {},
    order,
    optionOrder,
    bankOrder,
    revealed: {},
    seed,
    cardQueue,
    currentCardId: null,
    drawnCount: 0,
  };
}
