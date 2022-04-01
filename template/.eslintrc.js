const rules = {
  "no-var": "error",
  "prefer-const": "error",
  "no-unneeded-ternary": "error",
  "prefer-arrow-callback": "error",
  "no-lonely-if": "error",
  "consistent-return": "error",
  eqeqeq: "error",
  curly: "error",
  indent: "off",
};

module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  overrides: [
    {
      plugins: ["jest"],
      files: [
        "*.test.js",
        "*-test.js",
        "**/mock*.js",
        "**/__mocks__/**",
        "**/tests/**",
      ],
      env: {
        jest: true,
      },
    },
  ],
  rules,
};
