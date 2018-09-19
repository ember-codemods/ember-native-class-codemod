module.exports = {
  root: true,
  env: {
    node: true,
    es6: true
  },
  extends: ["eslint:recommended", "prettier"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error"
  }
};
