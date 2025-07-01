module.exports = {
  endOfLine: 'auto',
  printWidth: 100,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  tabWidth: 2,
  semi: true,
  plugins: ['prettier-plugin-tailwindcss'],
  overrides: [
    {
      files: ['**/routeTree.gen.ts'],
      options: {
        requirePragma: true,
      },
    },
  ],
};
