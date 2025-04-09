module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
    'jsx-a11y',
  ],
  rules: {
    'react/jsx-filename-extension': 0,
    'no-console': 0,
    'default-param-last': 0,
    "jsx-a11y/label-has-for": "off",
    "label-has-associated-control": "warn",
    'linebreak-style': ['error', process.platform === 'win32' ? 'windows' : 'unix'],
  },
};
