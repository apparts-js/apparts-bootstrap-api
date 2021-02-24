const express = require("express");
const applyMiddleware = require("./src/middleware");
const addRoutes = require("./src/routes");

/* ###< dbconfig >### */

const app = express();
/* ###< dbmiddleware >### */ applyMiddleware(app); /* ###< dbmiddleware >### */

addRoutes(app);

module.exports = app;
