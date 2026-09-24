import config from 'common.eslint';

export default [
  ...config,
  {
    ignores: ['tests/corpus/mathVisualizationCorpus.ts'],
  },
];

