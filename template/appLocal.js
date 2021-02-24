const express = require("express");
const applyMiddleware = require("./src/middleware");
const addRoutes = require("./src/routes");

/* ###< dbconfig >### */

const app = express();
app.use((req, res, next) => {
  req.headers = {
    ...req.headers,
    "x-apigateway-event": encodeURIComponent(
      JSON.stringify({
        path: "/foo/bar",
        requestContext: {
          identity: {},
        },
        queryStringParameters: {
          foo: "💩",
        },
      })
    ),
    "x-apigateway-context": encodeURIComponent(JSON.stringify({ foo: "bar" })),
  };
  next();
});
/* ###< dbmiddleware >### */ applyMiddleware(app, undefined, true); /* ###< dbmiddleware >### */

addRoutes(app);

module.exports = app;
