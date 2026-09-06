import globals from 'globals';

export default [
  {
    files: ['assets/*.js', 'assets/*.mjs', 'build-web.mjs', 'tests/*.mjs'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'no-constant-condition': 'error',
      'no-dupe-args': 'error',
      'no-dupe-keys': 'error',
      'no-unreachable': 'error',
      'no-unexpected-multiline': 'error',
      'no-undef': 'error',
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
      'valid-typeof': 'error',
    },
  },
];
