const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*'],
  },
  {
    rules: {
      'import/no-named-as-default': 'off',
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    files: ['test/**/*', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    languageOptions: { globals: globals.jest },
  },
]);
