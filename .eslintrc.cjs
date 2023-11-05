module.exports = {
  extends: ['alloy', 'alloy/react', 'alloy/typescript'],
  env: {
    browser: true,
    node: true,
    // mocha: true,
    // jest: true,
    // jquery: true
  },
  globals: {
    // ...
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [1, { args: 'none', ignoreRestSiblings: true }],
  },
};
