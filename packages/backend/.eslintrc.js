module.exports = {
  env: {
    es6: true,
    mocha: true,
    node: true,
    mongo: true,
  },
  rules: {
    "no-console": "off",
    "arrow-parens": ["error", "always"],
    "prettier/prettier": ["error", { arrowParens: "always" }],
    "comma-spacing": "error",
    semi: ["error", "always"],
    quotes: ["error", "double"],
    "no-unused-vars": "off",
    eqeqeq: "error",
    "no-alert": "error",
    curly: "error",
    "brace-style": ["error", "1tbs"],
    "object-curly-spacing": ["error", "always"],
    "function-call-argument-newline": ["error", "consistent"],
    "one-var-declaration-per-line": ["error", "always"],
    "padding-line-between-statements": [
      "error",
      {
        blankLine: "always",
        prev: ["const", "let", "var"],
        next: "*",
      },
      {
        blankLine: "any",
        prev: ["const", "let", "var"],
        next: ["const", "let", "var"],
      },
    ],
  },
  plugins: ["jsdoc", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "prettier/babel",
  ],
  parser: "babel-eslint",
};
