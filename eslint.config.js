import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // .kilo holds another tool's git-excluded worktrees, not this project's code.
  globalIgnores(['dist', '.kilo']),
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['server/**/*.js', 'scripts/**/*.js', 'api/**/*.js', 'tests/**/*.js', '*.config.js'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['shared/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals['shared-node-browser'] },
  },
])
