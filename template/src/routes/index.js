const addV1 = require("./v1");

const addRoutes = (app) => {
  addV1(app);
};

module.exports = addRoutes;
