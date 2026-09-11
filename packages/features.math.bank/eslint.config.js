import config from 'common.eslint';

export default [
  ...config,
  {
    ignores: ['scripts/append-historical-tasks.ts'],
  },
];
