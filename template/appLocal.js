const express = require("express");
const applyMiddleware = require("./src/middleware");
const addRoutes = require("./src/routes");

const DB_CONFIG = require("@apparts/config").get("db-config");

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
applyMiddleware(app, DB_CONFIG);

addRoutes(app);

module.exports = app;
