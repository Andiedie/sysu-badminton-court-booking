module.exports = {
  parserOptions: {
    sourceType: 'script',
    ecmaVersion: 8,
  },
  env: {
    browser: true
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // add your custom rules here
  rules: {
    'semi': ['warn', 'always']
  }
};
