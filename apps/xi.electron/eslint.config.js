import base from 'common.eslint';
import globals from 'globals';

export default [
  {
    ignores: ['out/**', 'release/**', 'dist/**', 'build/**'],
  },
  ...base,
  {
    files: ['src/main/**/*.ts', 'src/preload/**/*.ts', 'src/shared/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
