const { myRoute } = require("./myRoute");
/* ###<includes model api>### */
/* ###<includes login-server api>### */

const addRoutes = (app) => {
  // API
  app.get("/v/1/myRoute", myRoute);
  /* ###<route model api>### */
  /* ###<route login-server api>### */
};

module.exports = addRoutes;
