module.exports = {
  presets: ["@babel/preset-env", "@babel/preset-typescript"],
  plugins: [
    "@babel/transform-runtime",
    "@babel/plugin-syntax-bigint",
    [
      "module-resolver",
      {
        root: ["./src"],
        alias: {
          test: "./test",
        },
      },
    ],
  ],
};
