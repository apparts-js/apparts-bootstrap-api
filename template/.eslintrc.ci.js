const eslintrc = require("./.eslintrc.js");

let newRules = {};

for (const key of Object.keys(eslintrc.rules)) {
  newRules[key] = "error";
}

newRules = {
  ...newRules,
  indent: "off",
};

module.exports = {
  ...eslintrc,
  rules: newRules,
  // allow console log in tests
  globals: {
    ...eslintrc.globals,
    console: "off",
  },
  overrides: eslintrc.overrides.map((override) =>
    !(override.env || {}).jest
      ? override
      : {
          ...override,
          rules: newRules,
        }
  ),
};
