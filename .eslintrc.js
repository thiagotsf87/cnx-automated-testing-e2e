module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'playwright'],
  extends: ['eslint:recommended', 'plugin:playwright/recommended'],
  rules: {
    // TypeScript Rules
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
        args: 'after-used',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // Playwright Rules
    'playwright/expect-expect': 'error',
    'playwright/no-focused-test': 'error',
    'playwright/prefer-lowercase-title': 'error',
    'playwright/require-top-level-describe': 'error',

    // General Rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'eol-last': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    semi: ['error', 'always'],
    quotes: ['error', 'single', { avoidEscape: true }],
    'no-unused-vars': 'off', // Disable in favor of @typescript-eslint/no-unused-vars
  },
  overrides: [
    {
      files: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}'],
      rules: {
        // Relaxed rules for test files
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
        'playwright/require-top-level-describe': 'off',
        'playwright/expect-expect': 'off',
      },
    },
    {
      files: ['**/setup/**', '**/support/**'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'playwright-report/',
    'test-results/',
    'storage/',
    '*.config.js',
    '*.config.ts',
  ],
  env: {
    node: true,
    es2022: true,
  },
};
