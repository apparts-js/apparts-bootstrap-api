const express = require("express");
const applyMiddleware = require("./src/middleware");
const addRoutes = require("./src/routes");

const DB_CONFIG = require("@apparts/config").get("db-config");

const app = express();
applyMiddleware(app, DB_CONFIG);

addRoutes(app);

module.exports = app;
