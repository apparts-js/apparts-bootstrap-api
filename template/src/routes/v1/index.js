const { myRoute  } = require("./myRoute");


const addRoutes = (app) => {
  // API
  app.get("/v/1/myRoute", myRoute);
};

module.exports = addRoutes;
