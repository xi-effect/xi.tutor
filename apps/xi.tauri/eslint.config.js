import base from 'common.eslint';

/** Local ignores + shared monorepo rules (see packages/common.eslint/base.js). */
export default [
  {
    ignores: [
      'build/**',
      'dist/**',
      'src-tauri/target/**',
      'src-tauri/gen/**',
    ],
  },
  ...base,
];
